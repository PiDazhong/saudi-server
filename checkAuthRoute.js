const express = require('express');
const router = express.Router();

const AUTH_PASSWORD = 'Damons@2030';

router.post('/', (req, res) => {
  const { password } = req.body;
  if (password === AUTH_PASSWORD) {
    return res.json({ success: true, code: 1 });
  }
  res.status(401).json({ success: false, message: 'Invalid password' });
});

module.exports = router;
