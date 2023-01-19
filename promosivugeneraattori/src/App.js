import logo from './logo.svg'
import './App.css'
import React, { useState, useEffect } from 'react'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

function App() {

  const [kappaleenNimi, setKappaleenNimi] = useState("")
  const [kappale, setKappale] = useState(null);

  //let doc = new DOMParser().parseFromString("<html></html>", "text/html");
  let doc

  const lataaKappale = (e) => {
    setKappale(e.target.files[0])
    }

  function tallennaSivu() {
    /*
    let head = doc.createElement("head");
    let title = doc.createElement("title");
    title.textContent = kappaleenNimi;
    head.appendChild(title);
    doc.documentElement.appendChild(head);

    let body = doc.createElement("body");
    let h1 = doc.createElement("h1");
    h1.textContent = kappaleenNimi;
    body.appendChild(h1);
    doc.documentElement.appendChild(body);
    */
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

    /*
    const link = document.createElement("a");
    link.download = "promosivu.html";
    link.href = url;
    link.click();
    */ 
    }  

  return (
    <div className="App">
      <p><input type="file" onChange={lataaKappale} /></p>
      {kappale && <p>Selected file: {kappale.name}</p>}

      <form>  
      <label for="kappaleenNimi">Kappaleen nimi: </label>
        <input
          id="kappaleenNImi"
          type="text"
          value={kappaleenNimi}
          onChange={(e) => {setKappaleenNimi(e.target.value)}}
        />
      </form>
      <br/>
      <button type="button" onClick={() => tallennaSivu()} value="tallenna">Tallenna sivu</button>
      
    </div>
  );
}

export default App;
