import React, {Component} from 'react'

export default class Info extends React.Component {
  // Userinfo
  render() {
    return (
      <div className="sidebar">
        <div className="userinfo">
          <p>UserInfo: Show the two players name</p>
        </div>
        <div className="speculatorinfo">
          <p>Speculator: Show current speculators name</p>
        </div>
        <div className="score">
          <p>White * how many</p>
          <p>Black * how many</p>
        </div>
        <div className="turn">
          <p>Who's turn</p>
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
