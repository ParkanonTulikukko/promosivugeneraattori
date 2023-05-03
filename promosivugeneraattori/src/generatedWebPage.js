export function createHtmlPage(esittaja, kappaleenNimi, promoteksti) {

    // create html element
    const html = document.createElement('html');

    // create head element
    const head = document.createElement('head');
    html.appendChild(head);

    // create meta element
    const meta = document.createElement('meta');
    meta.setAttribute('charset', 'UTF-8');
    head.appendChild(meta);

    // create title element
    const title = document.createElement('title');
    title.textContent = `${esittaja} - ${kappaleenNimi}`;
    head.appendChild(title);

    // create link elements for font and stylesheet
    const preconnect1 = document.createElement('link');
    preconnect1.setAttribute('rel', 'preconnect');
    preconnect1.setAttribute('href', 'https://fonts.googleapis.com');
    head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.setAttribute('rel', 'preconnect');
    preconnect2.setAttribute('href', 'https://fonts.gstatic.com');
    preconnect2.setAttribute('crossorigin', '');
    head.appendChild(preconnect2);

    const font = document.createElement('link');
    font.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
    font.setAttribute('rel', 'stylesheet');
    head.appendChild(font);

    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('href', 'style.css');
    stylesheet.setAttribute('type', 'text/css');
    stylesheet.setAttribute('rel', 'stylesheet');
    head.appendChild(stylesheet);

    // create body element
    const body = document.createElement('body');
    html.appendChild(body);

    // create audio element
    const audio = document.createElement('audio');
    audio.setAttribute('id', 'player');
    body.appendChild(audio);

    const tiedostoNimiAlku = `${esittaja}-${kappaleenNimi}`
    const source = document.createElement('source');
    source.setAttribute('src', `${tiedostoNimiAlku}.mp3`);
    source.setAttribute('type', 'audio/mpeg');
    audio.appendChild(source);

    const audioText = document.createTextNode('Your browser does not support the audio element.');
    audio.appendChild(audioText);

    // create container div
    const container = document.createElement('div');
    container.id = 'container';
    body.appendChild(container); 

    const otsikko = document.createElement('div');
    otsikko.id = 'otsikko';
    otsikko.innerHTML = `${esittaja} - </br> ${kappaleenNimi}`.toUpperCase();
    container.appendChild(otsikko);


    const lataukset = document.createElement('div');
    lataukset.id = 'lataukset';
    lataukset.innerHTML = 'Lataukset:</br>';
    container.appendChild(lataukset);

    const esittajaJaKappale = `${esittaja} - ${kappaleenNimi}`
    const link1 = document.createElement('a');
    link1.href = `${tiedostoNimiAlku}.wav`;
    link1.textContent = `${esittajaJaKappale} (wav)`;
    lataukset.appendChild(link1);
    lataukset.appendChild(document.createElement("br"));

    const span1 = document.createElement('span');
    span1.textContent = '24bit 44,1 kHz';
    lataukset.appendChild(span1);
    lataukset.appendChild(document.createElement("br"));

    const link2 = document.createElement('a');
    link2.href = `${tiedostoNimiAlku}.mp3`;
    link2.textContent = `${esittajaJaKappale} (mp3)`;
    lataukset.appendChild(link2);
    lataukset.appendChild(document.createElement("br"));

    const span2 = document.createElement('span');
    span2.textContent = '256kbps 44,1 kHz';
    lataukset.appendChild(span2);

    const albumCover = document.createElement('div');
    albumCover.id = 'album-cover';

    const albumCoverImg = document.createElement('img');
    albumCoverImg.src = 'levynkansi.jpg';
    albumCoverImg.alt = 'Levyn kansi';
    albumCover.appendChild(albumCoverImg);

    const playPauseButton = document.createElement('button');
    playPauseButton.id = 'play-pause';
    playPauseButton.innerHTML = '▶';
    albumCover.appendChild(playPauseButton);

    container.appendChild(albumCover);

    const promotekstiDiv = document.createElement('div');
    promotekstiDiv.id = 'promoteksti';
    promotekstiDiv.innerHTML = `<i>${promoteksti}</i>`;
    container.appendChild(promotekstiDiv);

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video_container';

    const video = document.createElement('iframe');
    video.className = 'video';
    video.src = 'https://www.youtube.com/embed/lQ4D4W_kR8w';
    video.title = '';
    video.frameBorder = '0';
    video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    video.allowFullscreen = true;
    videoContainer.appendChild(video);

    container.appendChild(videoContainer);

    const somelinkit = document.createElement('div');
    somelinkit.innerHTML = 'somelinkit';
    container.appendChild(somelinkit);

    const script = document.createElement('script');
    script.src = 'player.js';
    body.appendChild(script);

    // Create the document
    const parser = new DOMParser();
    return parser.parseFromString(html.outerHTML, "text/html");
}