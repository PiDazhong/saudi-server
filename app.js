const express = require('express');
const cors = require('cors');
const fileRoute = require('./fileRoute');
const checkAuthRoute = require('./checkAuthRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/saudi-server/files', fileRoute);
app.use('/saudi-server/checkAuth', checkAuthRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
