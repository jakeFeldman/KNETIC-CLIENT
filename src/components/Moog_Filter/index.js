import React, { Component } from 'react';
import Knob from '../Knob';
import './Moog_Filter.css';

class Moog_Filter extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return(
      <div>
				<h2>Moog Filter</h2>
				<label htmlFor="moog-filter-control">Buffer: </label>
				<Knob sendDispatch={this.props.sendDispatch} type="moog_filter"
					property="buffer"
					min="256"
					max="16384"
				step="256" />
				<br/>
				<label htmlFor="moog-filter-control">Cutoff: </label>
				<Knob sendDispatch={this.props.sendDispatch} type="moog_filter"
					property="cutoff"
					min="0"
					max="1"
				step="0.05" />
				<br/>
				<label htmlFor="moog-filter-control">Res: </label>
				<Knob sendDispatch={this.props.sendDispatch} type="moog_filter"
					property="res"
					min="0"
					max="4"
				step="0.1" />
      </div>
		);
	}
}

export default Moog_Filter;