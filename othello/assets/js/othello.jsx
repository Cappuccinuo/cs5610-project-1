import React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';

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
    }

    channel.join()
      .receive("ok", resp => this.updateView(resp))
      .receive("error", resp => { console.log("Unable to join", resp); });

    this.updateView.bind(this);
    this.move.bind(this);
  }

  updateView(resp) {
    console.log("update state", resp);
    this.setState(resp.state);
    const players = this.state.players;
    const turn = this.state.turn

    if(window.userToken == players[turn]) {
      this.setState({lock: false});
    }
  }

  move(index, that) {
    console.log("clicked!");
    that.setState({
      lock: false, //FIXME
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
    let i = 0;
    const discs = this.state
                      .colors
                      .map((color) => {
                          return (
                            <Disc 
                              color={color} 
                              onClick={this.state.lock ? null : this.move}
                              index={i++}
                              parent={this}
                            />
                          );
                        });
    
    // TODO
    return (
      <Stage width={320} height={320} fill={'green'}>
        <Layer>
          {discs}
        </Layer>
      </Stage>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    const image = new window.Image();
    image.onload = () => {
      this.setState({
        fillPatternImage: image
      });
    }
    image.src = 'http://www.kissthemachine.com/images/reversi-rules1.png';
    this.state = {
      fillPatternImage: null
    };
  }
  render() {
    return (
      <Rect x={0} y={0}
            width={313} height={313}
            fillPatternImage={this.state.fillPatternImage}></Rect>
    );
  }
}

class Disc extends React.Component {
  render() {
    let color = this.props.color == 1 ? 'black' : 'grey';
    let opacity = this.props.color == 0 ? 0 : 1;
    let index = this.props.index;
    const radius = 20;
    let y = Math.floor(index/8)*radius*2+radius;
    let x = index%8*radius*2+radius;
    let parent = this.props.parent;
    let onClick = null;
    if(this.props.onClick) {
      onClick = () => {this.props.onClick(index, parent);}
    }
    
    return (
      <Circle
        radius={radius-2}
        fill={color}
        opacity={opacity}
        x={x}
        y={y}
        onClick={onClick}
      />
    );
  }
}
