import './App.css'
import uploadVideo from './youTube/youTubeUploadClient'
import React, { useState, useEffect } from 'react'
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
  const [kappale, setKappale] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [videotiedosto, setVideotiedosto] = useState(null);
  const [videonOtsikko, setVideonOtsikko] = useState('otsikko hieno');
  const [videonKuvaus, setVideonKuvaus] = useState('hyvä video');

  useEffect(() => {
    // Check if the access token is present in local storage
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // If the access token is not present, navigate to the authorization page
      return <Navigate to="/" />
      }
    /*
    axios.get('http://localhost:4000/api/config')
    .then(response => {
      // Use the API key to make requests to the YouTube API
      //console.log("tässä on api key: " + response.data["API_KEY"])
      setApiKey(response.data["API_KEY"])
    })
    .catch(error => {
      console.log(error);
    });
    */
  }, []);

  //let doc = new DOMParser().parseFromString("<html></html>", "text/html");
  let doc

  const lataaKappale = (e) => {
    setKappale(e.target.files[0])
    }

  function luoSivu() {

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

    lataaZip()
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
      <form onSubmit={luoSivu}>
        <input type="submit" value="Lähetä" /> 
      </form>

      
    </div>
  );
}

export default Lomake;
