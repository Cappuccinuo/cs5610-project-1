import React                                                          from 'react';
import ReactDOM                                                       from 'react-dom';
import { Circle } from 'react-konva';

export default class Disc extends React.Component {
  //let black = '../assets/static/images/black.png';
  //let white = '../assets/static/images/white.png';

  render() {
    
    //FIXME
    let opacity = this.props.color == 0 ? 0 : 1;
    let index = this.props.index;
    const radius = 25;
    let y = Math.floor(index/8)*radius*2+radius;
    let x = index%8*radius*2+radius;
    let parent = this.props.parent;
    let images = this.props.images;
    let onClick = null;
    if(this.props.onClick) {
      onClick = () => {this.props.onClick(index, parent);}
    }

    return (
      <Circle
        radius={radius-2}
        fillPatternImage={this.props.color == 1 ? images.black : images.white}
        fillPatternOffset={{x: x, y: y}}
        opacity={opacity}
        x={x}
        y={y}
        onClick={onClick}
      />
    );
  }
}
