const express = require('express');
const app = express();
var request = require("request");
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require("googleapis");
const FileReader = require('filereader');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const stream = require('stream');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const API_KEY = process.env.API_KEY
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/lomake'
 
app.listen(4000, () => {
  console.log('Server started on http://localhost:4000');
});
 
app.post('/api/config', (req, res) => {
  console.log("mikäs meillä täällä on client_id: " + CLIENT_ID)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json({ API_KEY: API_KEY, CLIENT_ID: CLIENT_ID, CLIENT_SECRET: CLIENT_SECRET });
});

app.post('/uploadVideo', upload.single('videotiedosto'), (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //const { accessToken, video } = req.body;
  console.log("req.body: ")
  console.log(req.body)
  const accessToken = req.body.accessToken
  const videotiedosto = req.file
  console.log("videotiedosto.path " + videotiedosto.path)

  /*
  const videoStream = new stream.PassThrough();
  videoStream.end(videotiedosto.buffer);
  console.log("videostreemin mimetype: " + videoStream.mimetype)
  */

  const videoStream = new stream.Readable();
  videoStream._read = function noop() {}; // do nothing
  videoStream.push(videotiedosto.buffer);
  videoStream.push(null);

  // Use the access token to make a request to the Google API
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  console.log("assecc tokeni uudessa endpointissa: " + accessToken);
  oAuth2Client.setCredentials({ access_token: accessToken });

  // Use the Google API to upload a video
  const youtube = google.youtube({
    version: "v3",
    auth: oAuth2Client,
  });
  
  const videoMetadata = {
    snippet: {
      title: req.body.title,
      description: req.body.description,
      //tags: req.body.tags,
      categoryId: req.body.categoryId
    },
    status: {
      privacyStatus: req.body.privacyStatus
    }
  };
  

  async function blobToBuffer(blob) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = function() {
        resolve(Buffer.from(this.result));
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob);
    });
  }

  if (!fs.existsSync(videotiedosto.path)) {
    console.error(`File path ${videotiedosto.path} does not exist`);
    return;
  }  

  const stats = fs.statSync(videotiedosto.path);
  if (stats.size === 0) {
    console.error(`File path ${videotiedosto.path} is empty`);
    return;
  } 
  
  
  youtube.videos.insert(
    {
      part: 'snippet,status',
      resource: videoMetadata,
      media: {
        body: fs.createReadStream(videotiedosto.path),
      }
    },
    (err, response) => {
      if (err) {
        console.log(err);
        return res.send({ error: "Error uploading video" });
      }
      res.send({ message: "Video uploaded successfully" });
    }
  );
  

});

app.post('/getStatistics', (req, res) => {
  const { accessToken } = req.body;

    console.log("**************************")
    console.log("getStatisticsin accessToken: " + accessToken);

    // Use the access token to make a request to the Google API
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ access_token: accessToken });
  
    // Example of making a request to the Google API
    const youtube = google.youtube({
      version: "v3",
      auth: oAuth2Client,
    });
  
    youtube.channels.list(
      {
        part: "snippet,contentDetails,statistics",
        mine: true,
      },
      (err, response) => {
        if (err) {
          console.log(err);
          return res.send({ error: "Error fetching data from API" });
        }               
        const channel = response.data.items[0];
        const statistics = channel.statistics;
        console.log("View count: ", statistics.viewCount);
        console.log("Comment count: ", statistics.commentCount);
        console.log("Subscriber count: ", statistics.subscriberCount);
        res.send(statistics);
      }
    );
  })  

app.post('/getAccessToken', (req, res) => {

  const { authorizationCode } = req.body;
  console.log("/post get accesstoken: " + req.body)
  // exchange the authorization code for access token
  console.log("authorizationCode on: " + authorizationCode);
  
  var options = { 
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      code: authorizationCode,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    } 
  };
  
  //res.json({ accessToken: "accessToken" });

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log("body: " + body)
    var parsedBody = JSON.parse(body);
    console.log("parsedBody: " + parsedBody)
    var accessToken = parsedBody.access_token;
    console.log("accessTokeni bakkärissä: " + accessToken);
    res.json({ accessToken: accessToken });
  });
  
});

