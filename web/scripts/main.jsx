import React from 'react';
import { render } from 'react-dom';
import App from './app.jsx';

let teams = [];

function setStreams(stream1, stream2 = null) {
    let streams = getStreams();

    if (stream1) {
        streams[0] = stream1;
    }

    if (stream2) {
        streams[1] = stream2;
    }


    window.location.hash = '/' + streams.join('/');
}

function setStream1(stream) {
    setStreams(stream);
}

function setStream2(stream) {
    setStreams(null, stream);
}

function getStreams() {
    let hash = window.location.hash.replace(/^#\/?|\/$/g, '');

    return hash ? hash.split('/') : [];
}

function getTeams() {
    fetch('./teams.json')
        .then((res) => res.json())
        .then((data) => {
            console.log('teams', data);
            teams = data;
            renderApp();
        });
}

function renderApp() {
    render(<App
            streams={getStreams()}
            teams={teams}
            setStream1={setStream1}
            setStream2={setStream2}
            />, document.getElementById('app'));
}

getTeams();
renderApp();

window.addEventListener('hashchange', renderApp, false);
