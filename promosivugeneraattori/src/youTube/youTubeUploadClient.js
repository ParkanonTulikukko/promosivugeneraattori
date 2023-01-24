import axios from 'axios';

async function uploadVideo(file, title, description, api_key) {
    const accessToken = window.localStorage.getItem("access_token")
    const formData = new FormData();
    formData.append('file', file, file.name)
    formData.append('part', 'snippet,status')
    formData.append('snippet.title', title)
    formData.append('snippet.description', description)
    formData.append('status.privacyStatus', 'private') 
    try {
      const response = await axios.post(
        'https://www.googleapis.com/youtube/v3/videos',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

export default uploadVideo