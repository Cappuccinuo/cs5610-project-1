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
    this.setState({lock: false});
  }

  move(index) {
    this.setState({
      lock: true,
    });
    channel.push("move", {index: index})
          .receive("ok", resp => this.updateView(resp));
  }


  render() {
    let i = 0;
    const discs = this.state
                      .colors
                      .map((color) => (
                            <Disc
                              color={color}
                              onClick={this.state.lock ? null : () => this.move(i)}
                              index={i++}
                            />
                          ));

    // TODO
    return (
      <Stage x={400} y={100} width={800} height={800}>
        <Layer>
          <Board />
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
    const radius = 50;
    let x = Math.floor(index/8)*radius*2;
    let y = index%8*radius*2;
    return (
      <Circle
        radius={radius}
        fill={color}
        opacity={opacity}
        x={x}
        y={y}
        onClick={this.props.onClick}
      />
    );
  }
}
