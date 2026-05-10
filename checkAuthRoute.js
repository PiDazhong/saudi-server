const express = require('express');
const { readCodeTable } = require('./codeTableRoute');
const router = express.Router();

function getAuthPasswords() {
  const table = readCodeTable();
  const entry = table['auth_password'];
  if (!entry || entry.value === null || entry.value === undefined) {
    return [];
  }
  try {
    const passwords = JSON.parse(entry.value);
    if (Array.isArray(passwords)) {
      return passwords;
    }
  } catch {
    // ignore parse error
  }
  return [];
}

router.post('/', (req, res) => {
  const { password } = req.body;
  const authPasswords = getAuthPasswords();
  if (authPasswords.includes(password)) {
    return res.json({ success: true, code: 1 });
  }
  res.status(401).json({ success: false, message: 'Invalid password' });
});

module.exports = router;
