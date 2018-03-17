import React, {PropTypes} from 'react';

export default class Logo extends React.Component {
  render() {
    return (
      <img className="logo"
        style={{width: 150, justifyContent: 'center', alignItems: 'center'}}
        src="/images/logo.png"/>
    );
  }
}
