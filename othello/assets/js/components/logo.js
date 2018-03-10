import React, {PropTypes} from 'react';

export default class Logo extends React.Component {
  render() {
    return (
      <img className="logo"
        style={{width: 150, justifyContent: 'center', alignItems: 'center'}}
        src="https://www.sfstl.com/wp-content/themes/shakespeare/layout/images/othello-poster.jpg"/>
    );
  }
}
