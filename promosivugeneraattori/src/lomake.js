import './App.css'
import uploadVideo from './youTube/youTubeUploadClient'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Navigate } from 'react-router-dom';
import { createHtmlPage } from './generatedWebPage';

const cssKoodi = `
#container {
  padding-top: 100px;
  position: relative;
  text-align: center;
  flex-wrap: wrap;
  flex-direction: column;
  width: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  }

#container > * {
  margin: 10px;
  }
  

#otsikko {
  font-size: 3.0em;
  }  

#album-cover {
  background-color: rgb(19, 19, 172);
  width: 400px;
  position: relative;
  height: 400px;
  }

#lataukset {
  margin-left: 10px;
  text-align: center;
  font-size: 2.0em;
  }
 
#promoteksti {
  margin-top: 10px;
  font-size: 2.0em;
  }

  #album-cover img {
    max-width: 400px;
    max-height: 400px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto; /* added */
    }
  
  button i {
    color: white;
    font-size: 2em;
  }

#play-pause {
    background-color: rgba(0, 0, 0, 0.4);
    border: 3px solid white;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: rgb(255, 255, 255);
  }

input[type="range"] {
    display: none;
}

.video_container {
  position: relative;
  width: 100%;
  height: 100%;
  padding-bottom: 56.25%;
  }
.video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  }
`;

const jsKoodi = `
  window.addEventListener('load', function() {

    const player = document.querySelector("#player");
    const playPauseButton = document.querySelector("#play-pause");
    
    playPauseButton.addEventListener("click", function() {
      if (playPauseButton.textContent === "▶") {
        player.play();
        playPauseButton.textContent = "❚❚"
      } else {
        player.pause();
        playPauseButton.textContent = "▶"
      }
    });
    
    })`

function Lomake() {

  const [esittaja, setEsittaja] = useState("Kissi")
  const [kappaleenNimi, setKappaleenNimi] = useState("Biisikappale")
  const [kappale, setKappale] = useState(null)
  const [videotiedosto, setVideotiedosto] = useState(null)
  const [videonOtsikko, setVideonOtsikko] = useState('otsikko hieno')
  const [videonKuvaus, setVideonKuvaus] = useState('hyvä video')
  const [promoteksti, setPromoteksti] = useState("Erittäin hyvä kappale - tee juttu ja ota soittolistalle!");
  const [wavTiedosto, setWavTiedosto] = useState(null);
  const [mp3Tiedosto, setMp3Tiedosto] = useState(null);
  const [levynkansitiedosto, setLevynkansitiedosto] = useState(null)
  const [otsikko, setOtsikko] = useState("");
  const [apiKey, setApiKey] = useState(null)
  let videoId = null;

  useEffect(() => {
    // Check if the access token is present in local storage
    const accessToken = localStorage.getItem('access_token');
    console.log("accessToken useffectossä: " + accessToken)
    //console.log("!accestoken on " + !accessToken)    
    if (accessToken === undefined || accessToken === null) {
      console.log("mentiin accessToken === undefined || accessToken === null)")
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if(!code) {
        return <Navigate to="/" />
        }
      requestAccessToken()
      }
  }, []);

  const requestAccessToken = async () => {
    // Fetch the ApiKey, ClientId and ClientSecret from the backend
    const { data } = await axios.post('http://localhost:4000/api/config');
    const { API_KEY } = data;
    setApiKey(API_KEY)
    // Get the authorization code from the query parameters of the URL
    const authorizationCode = new URLSearchParams(window.location.search).get('code');
  
    axios.post('http://localhost:4000/getAccessToken', { authorizationCode: authorizationCode }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      const { data } = res;
      const { accessToken } = data;
      localStorage.setItem('access_token', accessToken);
    });
  }

  let doc

  const lataaKappale = (e) => {
    setKappale(e.target.files[0])
    }

  async function testaa(e) {
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:4000/getStatistics', { accessToken });
      console.log(response);
      const channel = response;
      const statistics = channel.data;
      alert("View count: " + statistics.viewCount + "\nComment count: " +  statistics.commentCount + "\nSubscriber count: " + statistics.subscriberCount);
    } catch (error) {
      console.error(error);
      }
    }

  async function luoSivu(e) {
    //alert("nimi, tyyppi ja koko: " + videotiedosto.name + " " + videotiedosto.type + " " + videotiedosto.size)
    e.preventDefault()
    //lahetaVideo()
    lataaZip()
    }

  async function lahetaVideo() {
    const accessToken = localStorage.getItem('access_token');
    console.log("accestokeni frontissa: " + accessToken)

    const formData = new FormData();
    formData.append('title', videonOtsikko);
    formData.append('description', videonKuvaus);
    //formData.append('tags', ['tag1', 'tag2', 'tag3']);
    formData.append('categoryId', 22);
    formData.append('privacyStatus', 'private');
    formData.append('videotiedosto', videotiedosto);
    formData.append('accessToken', accessToken)

    }  

  async function lataaZip() {

    //luodaan zip-kansio
    const zip = new JSZip();
    const folder = zip.folder("promosivu");

    //html-sivu
    let htmlSivu = createHtmlPage(esittaja, kappaleenNimi, promoteksti).documentElement.outerHTML;
    const htmlBlob = new Blob([htmlSivu], { type: "text/html" });
    const url = URL.createObjectURL(htmlBlob);

    //lisätään kansioon html-sivu
    folder.file("index.html", htmlBlob)

    //luodaan JavaScript-tiedosto
    const jsBlob = new Blob([jsKoodi], { type: "text/javascript" })

    //luodaan CSS-tiedosto
    const cssBlob = new Blob([cssKoodi], { type: "text/css" })

    //luodaan kuvatiedosto
    const jpgBlob = new Blob([levynkansitiedosto], { type: "image/jpeg" }) 

    //luodaan mp3-tiedosto
    const mp3Blob = new Blob([mp3Tiedosto], { type: "audio/mp3" }) 

    //luodaan wav-tiedosto
    const wavBlob = new Blob([wavTiedosto], { type: "audio/wav" })

    //lisätään kansioon js- ja css-tiedostot
    folder.file("player.js", jsBlob)
    folder.file("style.css", cssBlob)
    folder.file("levynkansi.jpg", jpgBlob)
    folder.file(`${esittaja}-${kappaleenNimi}.mp3`, mp3Blob)
    folder.file(`${esittaja}-${kappaleenNimi}.wav`, wavBlob)

    // generate URL object for the zipped content
    const zipUrl = await folder.generateAsync({ type: "blob" }).then(blob => URL.createObjectURL(blob));

    // create a link element with the download attribute set to the filename
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = "promosivu.zip";

    // trigger a click event on the link element to start downloading
    link.click();

    /*
    NÄÄ ON JOTAIN VANHAA, en muista mitä, ei toimi

    function convertToBlob(file, fileType) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() {
          const blob = new Blob([reader.result], { type: fileType });
          resolve(blob);
        }
        reader.readAsArrayBuffer(file);
      });
    }
    
    const mp3Promise = convertToBlob(kappale, 'audio/mp3');
    const wavPromise = convertToBlob(wavTiedosto, 'audio/wav');
    
    Promise.all([mp3Promise, wavPromise]).then(([mp3Blob, wavBlob]) => {
      folder.file(kappaleenNimi + ".mp3", mp3Blob);
      folder.file(kappaleenNimi + ".wav", wavBlob);
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "promosivu.zip");
        URL.revokeObjectURL(url);
      });
    });
    */
    }  

  return (  
  <div className="App">
    <label>
      Esittäjä:
      <input type="text" value={esittaja} onChange={(e) => setEsittaja(e.target.value)} />
    </label>
    <br />
    <label for="kappaleenNimi">Kappaleen nimi: </label>
    <input
      id="kappaleenNimi"
      type="text"
      value={kappaleenNimi}
      onChange={(e) => {setKappaleenNimi(e.target.value)}}
    />
    <br />
    <label>
      Otsikko:
      <input type="text" value={otsikko} onChange={(e) => setOtsikko(e.target.value)} />
    </label>
    <br />
    <label>
      Promoteksti:
      <textarea value={promoteksti} onChange={(e) => setPromoteksti(e.target.value)} />
    </label>
    <br />
    <label>
      Levynkansitiedosto:  
      <input type="file" onChange={(e) => setLevynkansitiedosto(e.target.files[0])} />
    </label>
    <br />
    <label>
      MP3-tiedosto:  
      <input type="file" onChange={(e) => setMp3Tiedosto(e.target.files[0])} />
    </label>
    <br />  
    {kappale && <p>Selected file: {kappale.name}</p>}
    <label>
      WAV-tiedosto:  
      <input type="file" onChange={(e) => setWavTiedosto(e.target.files[0])} />
    </label>
    <br />
    <label>
      Videotiedosto:
      <input type="file" onChange={(e) => setVideotiedosto(e.target.files[0])} />
    </label>
    <br />
    <label>
      Videon otsikko:
      <input type="text" value={videonOtsikko} onChange={(e) => setVideonOtsikko(e.target.value)} />
    </label>
    <br />
    <label>
      Videon kuvaus:
      <textarea value={videonKuvaus} onChange={(e) => setVideonKuvaus(e.target.value)} />
    </label>
    <br />
    <form onSubmit={luoSivu}>
      <input type="submit" value="Lähetä" /> 
    </form>
    <button onClick={testaa}>Testaa</button>
  </div>

  );
}

export default Lomake;