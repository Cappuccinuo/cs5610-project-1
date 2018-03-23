import React, {Component} from 'react'

export default class Info extends React.Component {
  // Userinfo
  render() {
    let currentState = this.props.status.state;
    let playerA = currentState.players[0];
    let playerB = currentState.players[1];
    let turn = currentState.turn;
    let currentPlayer = currentState.players[turn];
    let i = 0;
    let speculators = currentState.speculators.map(speculator => {
                                          return (<p key={i++}>{speculator}</p>);
                                        });
    return (
      <div className="sidebar">
        <div className="userinfo">
          <p>UserInfo: Show the two players name</p>
          <p>{playerA}</p>
          <p>{playerB}</p>
        </div>
        <div className="speculatorinfo">
          <p>Speculator: Show current speculators name</p>
          {speculators}
        </div>
        <div className="score">
          <p>White * how many</p>
          <p>Black * how many</p>
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
