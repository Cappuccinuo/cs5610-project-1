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

    return (
      <div>
        <div className="sidebar">
          <div className="speculatorinfo">
            <p>Speculator:</p>
            {speculators}
          </div>
          <div>
            <div>
              <button>Exit(May delete the game)</button>
            </div>
          </div>
        </div>
    </div>
    )
  }
}
