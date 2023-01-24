const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
  //console.log("Klientti: " + process.env.CLIENT_ID)
  //console.log("api kiii: " + process.env.API_KEY)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json({ API_KEY: process.env.API_KEY, CLIENT_ID: process.env.CLIENT_ID, CLIENT_SECRET: process.env.CLIENT_SECRET });
});

app.listen(4000, () => {
  console.log('Server started on http://localhost:4000');
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

