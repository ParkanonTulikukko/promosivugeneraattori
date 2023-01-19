import logo from './logo.svg'
import './App.css'
import React, { useState, useEffect } from 'react'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {

  const [kappaleenNimi, setKappaleenNimi] = useState("")
  const [kappale, setKappale] = useState(null);

  let doc = new DOMParser().parseFromString("<html></html>", "text/html");

  const lataaKappale = (e) => {
    setKappale(e.target.files[0])
    }

  function tallennaSivu() {

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

    lataaZip()

    }

  function lataaZip() {
    let fileData = doc.documentElement.outerHTML;
    const blob = new Blob([fileData], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const zip = new JSZip();
    const folder = zip.folder("promosivu");

    folder.file("index.html", blob)

    const reader = new FileReader();
    reader.onload = function() {
      const mp3Blob = new Blob([reader.result], { type: 'audio/mp3' });
      folder.file(kappaleenNimi + ".mp3", mp3Blob);
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "promosivu.zip");
        URL.revokeObjectURL(url);
        });
      }
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
