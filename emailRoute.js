const express = require('express');
const nodemailer = require('nodemailer');
const { readCodeTable } = require('./codeTableRoute');
const { getClientIp } = require('./logRoute');

const router = express.Router();

function isBlacklisted(req) {
  const clientIp = getClientIp(req);
  const table = readCodeTable();
  const entry = table['black_ips'];
  if (!entry || entry.value === null || entry.value === undefined) {
    return false;
  }
  try {
    const blackList = JSON.parse(entry.value);
    if (Array.isArray(blackList)) {
      return blackList.includes(clientIp);
    }
  } catch {
    // ignore parse error
  }
  return false;
}

const EMAIL_INFO = {
  user: 'info@saudi-damons.com',
  pass: 'LevPmBsW9EPwR1yx',
  host: 'smtp.qiye.aliyun.com',
  port: 465,
  secure: true,
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

const transporter = nodemailer.createTransport({
  host: EMAIL_INFO.host,
  port: EMAIL_INFO.port,
  secure: EMAIL_INFO.secure,
  auth: {
    user: EMAIL_INFO.user,
    pass: EMAIL_INFO.pass
  }
});

router.post('/', async (req, res) => {
  if (isBlacklisted(req)) {
    return res.json({ success: true, code: 1, message: 'in' });
  }

  const { name, company, phone, email, message } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({
      success: false,
      code: 0,
      message: 'name, phone, email, message are all required'
    });
  }

  const timestamp = formatDate(new Date());

  const mailText = `Name: ${name}
Company: ${company}
Phone: ${phone}
Email: ${email}
Message: ${message}
Time: ${timestamp}`;

  const mailOptions = {
    from: EMAIL_INFO.user,
    to: 'showroom@saudi-damons.com',
    subject: 'New Inquiry from Web',
    text: mailText
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, code: 1, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, code: 0, message: err.message });
  }
});

module.exports = router;
