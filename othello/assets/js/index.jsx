import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';

export default function run_index(root) {
  ReactDOM.render(<Index />, root);
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  render() {
    let link = '/';
    if(this.state.name) {
      link = '/game/'+this.state.name;
    }

    return (
      <Form>
        <FormGroup>
          <Label>New Game or Join Existing Game): </Label>
          <Input onChange={this.handleChange} placeholder={'Enter game name'}/>
          <Button color='success' href={link}>Join Game</Button>
        </FormGroup>
      </Form>
    );
  }
}
