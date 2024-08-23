const express = require('express');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/', (req, res)=> {
  res.send('Hello')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})