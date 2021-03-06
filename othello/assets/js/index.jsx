import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import Logo                                                           from './components/logo.js';
import swal                                                           from 'sweetalert';

export default function run_index(root) {
  ReactDOM.render(<Index />, root);
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
    }
    if(window.info) {
      swal("", window.info, "warning");
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
    let currentUser = window.userToken;
    if(this.state.name) {
      link = '/game/'+this.state.name;
    }

    return (
      <div id="home_index" className="view-container">
        <header>
          <Logo />
          <h1 className="title">{currentUser}, Welcome to <a className="othello" target="_blank" href="https://en.wikipedia.org/wiki/Reversi">Othello</a></h1>
        </header>

        <button className="button_base electric" onClick={function(e) {
            e.preventDefault();
            if ($('.gameinput div').hasClass('active')) {
              $('.gameinput div').removeClass('active');
            }
            else {
              $('.gameinput div').addClass('active');
            }
          }}>
          <span>Join Game</span>
        </button>

        <form className="gameinput" onSubmit={function(e) {
            e.preventDefault();
            window.location=link;
          }}>

          <div className="input">
            <input onKeyUp={this.handleChange} placeholder={'Enter room name'}/>
            <button id="enter" type="submit" color='success'>Join/Create</button>
          </div>
        </form>

        <div>
          <button id="lobbybutton" className="button_base electric" onClick={function(e) {
              e.preventDefault();
              window.location = "/lobby";
            }}>
            <span>Game Lobby</span>
          </button>
        </div>

        <footer className="github">
          <p><a target="_blank" href="https://github.com/YuqingCheng/cs5610-project-1"><i className="fab fa-github"/> source code</a></p>
        </footer>
      </div>
    );
  }
}
