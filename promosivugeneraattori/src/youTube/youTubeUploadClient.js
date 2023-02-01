import axios from 'axios';
//const {google} = require('googleapis');

async function uploadVideo(file, title, description, apiKey) {

  if (!file || !title || !description) {
    console.error("Video file and metadata are required to make the upload");
    return;
    }  
  const accessToken = window.localStorage.getItem("access_token")

  const enc = new TextEncoder();
  const accessTokenEncoded = enc.encode(accessToken)
  const apiKeyEncoded = enc.encode(apiKey)

  const formData = new FormData();
  formData.append('file', file, file.name)
  formData.append('part', 'snippet,status')
  formData.append('snippet.title', title)
  formData.append('snippet.description', description)
  formData.append('status.privacyStatus', 'private') 
  /*try {
    const response = await axios.post(
      'https://www.googleapis.com/youtube/v3/videos',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessTokenEncoded}`,
          'X-Goog-Upload-Protocol': 'raw', //
          'X-Goog-Upload-File-Name': file.name, //
          'X-Goog-Upload-Header-Content-Type': file.type, //
          'X-Goog-Upload-Header-Content-Length': file.size, //
          'X-Goog-Upload-Command': 'start',//
          'X-Goog-Upload-Header-Content-Range': 'bytes 0-0/'+file.size,//
          'Content-Type': 'multipart/related',//
          'X-Goog-Upload-Server-Response': 'v=3',
          'X-Goog-Upload-Url': `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status&key=${apiKeyEncoded}`,//
        },
      }
    );
    alert(response.data)
    return response.data;
  } catch (error) {
    console.error(error);
  }*/
  console.log("accestokenencoded: " + accessTokenEncoded)
  console.log("accestoken not encoded: " + accessToken)
  axios.get('https://www.googleapis.com/youtube/v3/channels', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'key': apiKey
    }
    })
  .then(response => {
    // Check the response to see if the access token is valid
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });

  }

export default uploadVideo