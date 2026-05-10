const express = require('express');
const router = express.Router();

const AUTH_PASSWORDS = ['Damons@2030', '15927561801'];

router.post('/', (req, res) => {
  const { password } = req.body;
  if (AUTH_PASSWORD.includes(password)) {
    return res.json({ success: true, code: 1 });
  }
  res.status(401).json({ success: false, message: 'Invalid password' });
});

module.exports = router;
