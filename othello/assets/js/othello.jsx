import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import { Stage, Layer, Rect, Text, Circle, Line }                     from 'react-konva';
import Konva                                                          from 'konva';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import Disc                                                           from './components/disc.jsx';
import Info                                                           from "./info.jsx";
import {NotificationContainer, NotificationManager}                   from 'react-notifications';
import swal                                                           from 'sweetalert';

export default function run_othello(root, channel) {
  ReactDOM.render(<Othello channel={channel}/>, root);
}

class Othello extends React.Component {
  constructor(props) {
    super(props);
    const channel = props.channel;

    this.state = {
      colors:[],
      players:[],
      speculators:[],
      turn: -1,
      winner: null,
      lock: true,
      images: {},
    }

    this.loadImages.bind(this);

    this.loadImages();

    channel.on("new:state", resp => this.updateView(resp));

    channel.on("new:user", resp => {
      this.updateView(resp);
      if(resp["type"] == "success") {
        NotificationManager.success(resp.msg, '');
      } else if(resp["type"] == "info") {
        NotificationManager.info(resp.msg, '');
      }
    });

    channel.on("user:leave", resp => {
      if(resp["type"] == "warning") {
        swal("", resp.msg, resp["type"]);
      }else{
        NotificationManager.info(resp.msg, '');
      }
    });

    channel.on("table:close", resp => {
      swal("", resp.msg, resp["type"]);
      setTimeout(() => window.location.replace("/"), 1000);
    });

    channel.join()
      .receive("ok", resp => this.updateView(resp))
      .receive("error", resp => { console.log("Unable to join", resp); });

    this.updateView.bind(this);
    this.move.bind(this);
  }

  loadImages() {
    let black = '/images/black.png';
    let white = '/images/white.png';
    let board = '/images/wood-board.png';
    var images = {};
    var i = 0;
    images['black'] = new Image();
    images['black'].onload = () => {
                              if(i++ >= 2) this.setState({images: images});
                            }
    images['white'] = new Image();
    images['white'].onload = () => {
                              if(i++ >= 2) this.setState({images: images});
                            }
    images['board'] = new Image();
    images['board'].onload = () => {
                              if(i++ >= 2) this.setState({images: images});
                            }
    images['black'].src = black;
    images['white'].src = white;
    images['board'].src = board;
  }

  updateView(resp) {
    console.log("update state", resp);
    this.setState(resp.state);
    if(resp.state.winner != null) {
      // winner == 0, 0 wins, winner == 1, 1 wins, winner == 2, ties
      if(resp.state.winner == 2) {
        // show game tie to all players and speculators
        swal("Game over!", "Tie!", "info");
      }
      else if(resp.state.players[~resp.state.winner+2] == window.userToken) {
        // only show lose info to loser
        swal("Game over!", resp.state.players[~resp.state.winner + 2]+", keep fighting!", "warning");
      }
      else {
        // show win to winner and speculators
        swal("Game over!", resp.state.players[resp.state.winner]+", you wins!", "success");
      }
      this.props.channel.push("restart", {})
          .reveive("ok", resp => {});

    }

    const players = this.state.players;
    const turn = this.state.turn

    if(resp.state.winner == null && window.userToken == players[turn]) {
      this.setState({lock: false});
    }

    if(!resp["type"] && resp.msg) {
      swal("Info", resp.msg + "", "info")
    }
  }

  move(index, that) {
    if (that.state.players.length < 2) {
      swal("Oops!", "Please wait for your opponent", "error");
      return;
    }
    that.setState({
      lock: true,
    });
    that.props.channel.push("move", {index: index})
          .receive("ok", resp => that.updateView(resp))
          .receive("error", resp => {
            swal("Oops!", "Cannot move here", "error");
            that.setState({lock: false});
          });
  }

  quit() {
    this.props.channel.push("quit", {})
          .receive("ok", resp => {});
  }

  restart() {
    this.props.channel.push("restart", {})
          .reveive("ok", resp => {});
  }

  render() {
    // TODO
    let i = 0;
    let currentState = this.state;
    const discs = this.state.colors.map(color => {
                                          return (<Disc
                                                    key={i}
                                                    color={color}
                                                    onClick={this.state.lock ? null : this.move}
                                                    parent={this}
                                                    index={i++}
                                                    images={this.state.images}
                                                    />);
                                        });

    const encoded = window.gameName;
    const parser = new DOMParser;
    let name = parser.parseFromString('<!doctype html><body>'+encoded, 'text/html').body.textContent;

    let playerA = currentState.players[0];
    let playerB = currentState.players[1];

    let turn = currentState.turn;
    let currentPlayer = currentState.players[turn];

    let player = window.userToken;
    let playerInfo = currentState.players.length == 2 ? playerA + " vs " + playerB : player + " is waiting for a match";

    let turnInfo = currentState.players.length == 2 ? currentPlayer + "'s turn" : "Wait matching.";

    let white = 0, black = 0;
    for(var j = 0; j < currentState.colors.length; j++) {
      if(currentState.colors[j] == 1) {
        black++;
      } else if(currentState.colors[j] == 2) {
        white++;
      }
    }

    let lines = [];

    for(var j = 1; j < 8; j++) {
      var lineX = (<Line
                    key={j}
                    points={[j*50, 0, j*50, 400]}
                    stroke={'rgb(249, 208, 144)'}
                    stokeWidth={1}
                    closed={true}
                  />);
      var lineY = (<Line
                    key={j+7}
                    points={[0, j*50, 400,j*50]}
                    stroke={'rgb(249, 208, 144)'}
                    stokeWidth={1}
                    closed={true}
                  />);
      lines.push(lineX);
      lines.push(lineY);
    }
    return (
      <div id="main_container" className="containergame">
        <div id="game_show" className="view-container">
          <section id="main_section">
            <header id="game_header">
              <h1>
                Table: {name}
              </h1>
              <h2>
                Match: {playerInfo}
              </h2>
            </header>
            <section id="boards_container">
              <Stage width={400} height={400}>
                <Layer>
                  <Rect
                    width={400}
                    height={400}
                    cornerRadius={8}
                    fillPatternImage={this.state.images['board']}
                    fillPatternScale={1}
                    //fillPatternOffset={{x: x, y: y}}
                  />
                  {lines}
                  {discs}
                </Layer>
              </Stage>
              <div className="score">
                <p>{turnInfo}</p>
                <div>
                  <img className="whitenum" src="/images/white.png"></img>
                  <span><i class="fas fa-times"></i>{white}</span>
                </div>
                <div>
                  <img className="blacknum" src="/images/black.png"></img>
                  <span><i class="fas fa-times"></i>{black}</span>
                </div>
              </div>
              <div>
                <div className="exit">
                  <button className="button_base elec">Exit</button>
                </div>
              </div>
            </section>
          </section>
          <aside id="info_container">
            <Info status={this}/>
          </aside>
        </div>
        <NotificationContainer />
      </div>
    );
  }
}
