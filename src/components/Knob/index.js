// import React from 'react';
//
// import './Knob.css';
//
// const Knob = (props) => {
//   return (<input id="knob" type="range" min={props.min} max={props.max} step={props.step} data-degree-range="270" defaultValue="0"
//   onChange={(event) => props.sendDispatch(props.type, props.property, event.target.value)} data-degree-offset="45"/>);
// };
//
// export default Knob;


import React, { Component } from 'react';
import KnobComp from 'react-canvas-knob';

class Knob extends Component {
  constructor(props) {
    super(props);
    this.state = {
			value: 0
		};
		this.handleChange = this.handleChange.bind(this);
  }
  handleChange = (newValue) => {
		this.props.sendDispatch(this.props.type, this.props.property, newValue, this.props.id);
    this.setState({
			value: newValue
		});
  };

  handleChangeEnd(event) {
  };

  render() {
    return (
      <KnobComp
        value={this.state.value}
        onChange={this.handleChange}
        onChangeEnd={this.handleChangeEnd}
        thickness={0.25}
        width={50}
        height={50}
        stopper={true}
        angleArc={270}
        angleOffset={-135}
        disableMouseWheel={true}
        displayInput={false}
        fgColor="#94E4C2"
        inputColor="#94E4C2"
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
      />
    );
  }
}

export default Knob;
