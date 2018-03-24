// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";
import socket from "./socket.js";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
import run_index from "./index.jsx";
import run_othello from "./othello.jsx";

function init() {
  let index = document.getElementById('index');
  let game = document.getElementById('game');
  if (index) {
    run_index(index);
  }
  if(game) {
    // parsing method attribution goes to answer by Jeremy Banks:
    // https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    const encoded = window.gameName;
    const parser = new DOMParser;
    const decoded = parser.parseFromString('<!doctype html><body>'+encoded, 'text/html').body.textContent;
    let channel = socket.channel("gamechannel:"+decoded, {});
    run_othello(game, channel);
  }
}

$(init);
