import './App.css'
import uploadVideo from './youTube/youTubeUploadClient'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Navigate } from 'react-router-dom';

const cssKoodi = `
  #playButton {
    background-color: green;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
  }`

const jsKoodi = `
  function playPause() {
      let audioPlayer = document.getElementById("audioPlayer");
      let playButton = document.getElementById("playButton");
      if (audioPlayer.paused) {
          audioPlayer.play();
          playButton.innerHTML = "Pause";
      } else {
          audioPlayer.pause();
          playButton.innerHTML = "Play";
      }
  }`

function Lomake() {

  const [kappaleenNimi, setKappaleenNimi] = useState("Biisikappale")
  const [kappale, setKappale] = useState(null)
  const [videotiedosto, setVideotiedosto] = useState(null)
  const [videonOtsikko, setVideonOtsikko] = useState('otsikko hieno')
  const [videonKuvaus, setVideonKuvaus] = useState('hyvä video')
  const [apiKey, setApiKey] = useState(null)

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

  async function luoSivuTmp(e) {
    e.preventDefault()
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

  function luoSivu(e) {

    //alert("nimi, tyyppi ja koko: " + videotiedosto.name + " " + videotiedosto.type + " " + videotiedosto.size)

    uploadVideo(videotiedosto, videonOtsikko, videonKuvaus, apiKey);

    const parser = new DOMParser();
    // Create the audio element
    const audioPlayer = document.createElement("audio");
    audioPlayer.setAttribute("id", "audioPlayer");
    audioPlayer.setAttribute("src", kappaleenNimi+".mp3");

    // Create the play button element
    const playButton = document.createElement("button");
    playButton.setAttribute("id", "playButton");
    playButton.setAttribute("onclick", "playPause()");
    playButton.innerHTML = "Play";

    // Create the link element
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "styles.css");

    // Create the script element
    const script = document.createElement("script");
    script.setAttribute("src", "player.js");

    // Create the head element
    const head = document.createElement("head");
    head.appendChild(link);
    head.appendChild(script);

    // Create the body element
    const body = document.createElement("body");
    body.appendChild(audioPlayer);
    body.appendChild(playButton);

    // Create the html element
    const html = document.createElement("html");
    html.appendChild(head);
    html.appendChild(body);

    // Create the document
    doc = parser.parseFromString(html.outerHTML, "text/html");

    //lataaZip()
    e.preventDefault();
    }

  function lataaZip() {

    //luodaan zip-kansio
    const zip = new JSZip();
    const folder = zip.folder("promosivu");

    //html-sivu
    let htmlSivu = doc.documentElement.outerHTML;
    const htmlBlob = new Blob([htmlSivu], { type: "text/html" });
    const url = URL.createObjectURL(htmlBlob);

    //lisätään kansioon html-sivu
    folder.file("index.html", htmlBlob)

    //luodaan JavaScript-tiedosto
    const jsBlob = new Blob([jsKoodi], { type: "text/javascript" })

    //luodaan CSS-tiedosto
    const cssBlob = new Blob([cssKoodi], { type: "text/css" })

    //lisätään kansioon js- ja css-tiedostot
    folder.file("player.js", jsBlob)
    folder.file("styles.css", cssBlob)

    const reader = new FileReader();
    reader.onload = function() {

      //reader.resultissa on jo kappale, tsekkaa rivi tämän funktion jälkeen,
      //josta funktiota kutsutaan
      const mp3Blob = new Blob([reader.result], { type: 'audio/mp3' });

      //lisätään kansioon mp3:nen
      folder.file(kappaleenNimi + ".mp3", mp3Blob);
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "promosivu.zip");
        URL.revokeObjectURL(url);
        });
      }
    
    //lisätään kappale  
    reader.readAsArrayBuffer(kappale);
    }  

  return (
    <div className="App">
      <label for="kappaleenNimi">Kappaleen nimi: </label>
        <input
          id="kappaleenNImi"
          type="text"
          value={kappaleenNimi}
          onChange={(e) => {setKappaleenNimi(e.target.value)}}
        />
      <br />  
      <label>
        MP3-tiedosto:  
        <input type="file" onChange={lataaKappale} />
      </label>
      <br />  
      {kappale && <p>Selected file: {kappale.name}</p>}
      <label>
        Videotiedosto:
        <input type="file" onChange={e => setVideotiedosto(e.target.files[0])} />
      </label>
      <br />
      <label>
        Videon osikko:
        <input type="text" value={videonOtsikko} onChange={e => setVideonOtsikko(e.target.value)} />
      </label>
      <br />
      <label>
        Videon kuvaus:
        <textarea value={videonKuvaus} onChange={e => setVideonKuvaus(e.target.value)} />
      </label>
      <br />
      <form onSubmit={luoSivuTmp}>
        <input type="submit" value="Lähetä" /> 
      </form>
    </div>
  );
}

export default Lomake;
