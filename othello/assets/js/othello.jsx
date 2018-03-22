import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import { Stage, Layer, Rect, Text, Circle }                           from 'react-konva';
import Konva                                                          from 'konva';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import Disc                                                           from './components/disc.jsx';
import Info                                                           from "./info.jsx";
import {NotificationContainer, NotificationManager} from 'react-notifications';

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

    channel.join()
      .receive("ok", resp => this.updateView(resp))
      .receive("error", resp => { console.log("Unable to join", resp); });

    this.updateView.bind(this);
    this.move.bind(this);
  }

  loadImages() {
    let black = '/images/black.png';
    let white = '/images/white.png';
    var images = {};
    var i = 0;
    images['black'] = new Image();
    images['black'].onload = () => {
                              if(i++ >= 1) this.setState({images: images});
                            }
    images['white'] = new Image();
    images['white'].onload = () => {
                              if(i++ >= 1) this.setState({images: images});
                            }
    images['black'].src = black;
    images['white'].src = white;

  }

  updateView(resp) {
    console.log("update state", resp);
    this.setState(resp.state);
    if(resp.state.winner != null) {
      alert(resp.state.players[resp.state.winner]+" wins!");
    }
    
    const players = this.state.players;
    const turn = this.state.turn

    if(window.userToken == players[turn]) {
      this.setState({lock: false});
    }

    if(!resp["type"] && resp.msg) {
      alert(resp.msg);
    }
  }

  move(index, that) {
    console.log("clicked!");
    that.setState({
      lock: true,
    });
    that.props.channel.push("move", {index: index})
          .receive("ok", resp => that.updateView(resp))
          .receive("error", resp => {
            console.log("update state", resp);
            alert("cannot move here");
            that.setState({lock: false});
          });
  }

  render() {
    // TODO
    let i = 0;
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
    let name = window.gameName;
    return (
      <div id="main_container">
        <div id="game_show" className="view-container">
          <section id="main_section">
            <header id="game_header">
              <h1>
                Othello: {name}
              </h1>
            </header>
            <section id="boards_container">
              <Stage width={400} height={400} fill={'green'}>
                <Layer>
                  {discs}
                </Layer>
              </Stage>
            </section>
          </section>
          <aside id="info_container">
            <Info />
          </aside>
        </div>
        <NotificationContainer />
      </div>
    );
  }
}
