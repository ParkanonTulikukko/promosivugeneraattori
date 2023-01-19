import logo from './logo.svg'
import './App.css'
import React, { useState, useEffect } from 'react'
//import CardProfile from './player/Player.js';

function App() {

  const [kappaleenNimi, setKappaleenNimi] = useState("")

  function annaFile() {
    let doc = new DOMParser().parseFromString("<html></html>", "text/html");

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

    let fileData = doc.documentElement.outerHTML;

    const blob = new Blob([fileData], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "promosivu.html";
    link.href = url;
    link.click(); 
    }

  function handleChange(e) {
    setKappaleenNimi(e.target.value)
    }

  return (
    <div className="App">
        <input
          type="text"
          value={kappaleenNimi}
          onChange={handleChange}
        />
      <button type="button" onClick={() => annaFile()} value="tallenna">tallenna</button> 
    </div>
  );
}

export default App;
