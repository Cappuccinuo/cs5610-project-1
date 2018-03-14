import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import { Stage, Layer, Rect, Text, Circle }                           from 'react-konva';
import Konva                                                          from 'konva';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import Disc                                                           from './components/disc'

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

  renderDiscs(colors) {
    return (
      <div>
        <Row>
          {_.map(colors, (color, index) =>
            <Disc key={index}
              index={index}
              color={color}
              onClick={this.state.lock ? null : this.move}
              parent={this}
              />)}
        </Row>
      </div>
    )
  }

  render() {
    // TODO
    return (
      <div>
        <Container>
          <Row>
            <Col lg="8">
              {this.renderDiscs(this.state.colors)}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

class Discs extends React.Component {
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
      onClick = () => {this.props.move(index, parent);}
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
