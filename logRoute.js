const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const router = express.Router();
const LOG_DIR = path.join(__dirname, 'logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogFileName(dateStr) {
  return path.join(LOG_DIR, `${dateStr}.log`);
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    ''
  );
}

function getDevice(req) {
  return req.headers['user-agent'] || '';
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
  }
  return dates;
}

// 写入日志
router.post('/write', (req, res) => {
  const { action } = req.body;
  if (!action) {
    return res.status(400).json({ success: false, message: 'action is required' });
  }

  const logEntry = {
    action,
    timestamp: formatDate(new Date()),
    device: req.body.device || getDevice(req),
    ip: req.body.ip || getClientIp(req)
  };

  const line = JSON.stringify(logEntry) + '\n';
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const fileName = getLogFileName(`${y}-${m}-${d}`);

  ensureLogDir();

  fs.appendFile(fileName, line, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, code: 1, message: 'Logged successfully' });
  });
});

// 查询日志
router.post('/query', async (req, res) => {
  const { startDate, endDate, action } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
  }

  const dates = getDatesInRange(startDate, endDate);
  const results = [];

  for (const dateStr of dates) {
    const fileName = getLogFileName(dateStr);
    if (!fs.existsSync(fileName)) {
      continue;
    }

    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (action && entry.action !== action) {
          continue;
        }
        results.push(entry);
      } catch {
        // 跳过无法解析的行
      }
    }
  }

  res.json({ success: true, code: 1, count: results.length, data: results });
});

module.exports = router;
