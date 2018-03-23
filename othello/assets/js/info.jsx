import React, {Component} from 'react'

export default class Info extends React.Component {
  // Userinfo
  render() {
    let currentState = this.props.status.state;
    let playerA = currentState.players[0];
    let playerB = currentState.players[1] == null ? "Please wait for your opponent." : currentState.players[1];
    let turn = currentState.turn;
    let currentPlayer = currentState.players[turn];
    let colors = currentState.colors;
    let i = 0;
    let speculators = currentState.speculators.map(speculator => {
                                          return (<p key={i++}>{speculator}</p>);
                                        });
    let white = 0, black = 0;
    for(var j = 0; j < colors.length; j++) {
      if(colors[j] == 1) {
        black++;
      } else if(colors[j] == 2) {
        white++;
      }
    }
    return (
      <div className="sidebar">
        <div className="userinfo">
          <p>Players:</p>
          <p>{playerA}</p>
          <p>{playerB}</p>
        </div>
        <div className="speculatorinfo">
          <p>Speculator:</p>
          {speculators}
        </div>
        <div className="score">
          <p>White * {white}</p>
          <p>Black * {black}</p>
        </div>
        <div className="turn">
          <p>{currentPlayer}{"'s turn"}</p>
        </div>
        <div>
          <div>
            <button>Exit(May delete the game)</button>
          </div>
        </div>
      </div>
    )
  }
}
