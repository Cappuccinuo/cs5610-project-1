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
                                          return (<li key={i++}><i class="fas fa-user"></i>{speculator}</li>);
                                        });

    return (
      <div className="sidebar">
        <div>
         
          <div className="userbar">
          <div>
                <div className="exit">
                  <button onClick={function(e) {
                      e.preventDefault();
                      window.location="/";
                    }} className="button_base elec">Exit</button>
                </div>
              </div>
            <div className="playerinfo">
              <div>
                <span>Players</span>
              </div>
              <ul>
                <li><i class="fas fa-user-secret"></i>{playerA}</li>
                <li><i style={{color: "#FFFFFF"}} class="fas fa-user-secret"></i>{playerB}</li>
              </ul>
            </div>
            <div className="speculatorinfo">
              <div>
                <span>Speculators</span>
              </div>
              <ul>
                {speculators}
              </ul>
            </div>
          </div>
        </div>
    </div>
    )
  }
}
