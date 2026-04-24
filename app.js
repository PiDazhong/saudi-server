const express = require('express');
const fileRoute = require('./fileRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/files', fileRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
