import React, {Component} from 'react';

export default function(props) {
  //let black = '../assets/static/images/black.png';
  //let white = '../assets/static/images/white.png';
  let black = '/images/black.png';
  let white = '/images/white.png';
  var blackDisc = {
    backgroundImage: 'url(' + black + ')',
    width: 90,
    height: 70,
  }
  var whiteDisc = {
    backgroundImage: 'url('+ black +')',
    width: 90,
    height: 70
  }

  const colornow = (color) => {
    if (color == 1) {
      return blackDisc;
    }
    else if (color == 2) {
      return whiteDisc;
    }
    else {
      return whiteDisc;
    }
  }

  let parent = props.parent;
  let index = props.index;
  let onClick = null;
  if(props.onClick) {
    onClick = () => {props.move(index, parent);}
  }

  return (
    <div>
      <div className="disc"
        style={colornow(props.color)}
        onClick={onClick}>
      </div>
    </div>
  );
}
