import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';

export default function run_othello(root, channel) {
  ReactDOM.render(<Othello channel={channel}/>, root);
}

class Othello extends React.Component {
  constructor(props) {
    super(props);
    const channel = props.channel;

    channel.join()
      .receive("ok", resp => this.updateView(this.state, resp))
      .receive("error", resp => { console.log("Unable to join", resp); });
    
    this.updateView.bind(this);
  }

  updateView(state, resp) {
    console.log("update state", resp);
  }

  
  render() {
    // TODO
    return (
      <div>

      </div>
    );
  }
}
