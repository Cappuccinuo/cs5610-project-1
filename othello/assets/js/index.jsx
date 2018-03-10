import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import { Button, Container, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import Logo                                                           from './components/logo'

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
      <div id="home_index" className="view-container">
        <header>
          <Logo />
          <h1>Welcome to <a target="_blank" href="https://en.wikipedia.org/wiki/Othello">Othello</a></h1>
        </header>
        <Form>
          <FormGroup>
            <div className="input">
              <Input onChange={this.handleChange} placeholder={'Enter game name'}/>
            </div>
            <div className="join">
              <Button id="enter" color='success' href={link}>Join Game</Button>
            </div>
          </FormGroup>
        </Form>
        <footer>
          <p><a target="_blank" href="https://github.com/YuqingCheng/cs5610-project-1"><i className="fab fa-github"/> source code</a></p>
        </footer>
      </div>
    );
  }
}
