const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const BASE_DIR = path.resolve(__dirname);

function safeResolve(targetPath) {
  const resolved = path.resolve(BASE_DIR, targetPath);
  if (!resolved.startsWith(BASE_DIR)) {
    throw new Error('Invalid path');
  }
  return resolved;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.body.path || '';
    try {
      const dest = safeResolve(targetPath);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// 获取路径下的所有文件名称
router.get('/list', (req, res) => {
  const targetPath = req.query.path || '';
  try {
    const resolvedPath = safeResolve(targetPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'Path not found' });
    }
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ success: false, message: 'Path is not a directory' });
    }
    const files = fs.readdirSync(resolvedPath);
    res.json({ success: true, data: files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 删除文件或目录
router.delete('/delete', (req, res) => {
  const targetPath = req.query.path || req.body.path;
  if (!targetPath) {
    return res.status(400).json({ success: false, message: 'Path is required' });
  }
  try {
    const resolvedPath = safeResolve(targetPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'Path not found' });
    }
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      fs.rmSync(resolvedPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(resolvedPath);
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 文件上传
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, message: 'Uploaded successfully', data: req.file.originalname });
});

module.exports = router;
