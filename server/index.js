const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Mantis Bug Tracker API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
