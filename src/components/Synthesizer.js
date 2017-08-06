import React, {Component} from 'react';
import Layout from './Layout';
import Tuna from 'tunajs';
import {KeyFreqs} from '../keyfreqs';
import patch from '../patch';


const audioContext = new AudioContext();
const tuna = Tuna(audioContext);
let KN_SYNTH = false;

const synths = [];


function initMidi(playNote, stopNote) {
	if(navigator.requestMIDIAccess){
		console.log('Browser Supports KNETIC');
		navigator.requestMIDIAccess().then(success, failure);
	}

	function success(midi){
		var inputs = midi.inputs.values();
		console.log('We Got Fucking MIDI');

		for (var input = inputs.next();
		input && !input.done;
		input = inputs.next()) {
			// each time there is a midi message call the onMIDIMessage function
			input.value.onmidimessage = onMIDIMessage;
		}
	}
	function failure(){
		console.error('No Access To MIDI');
	}

	function onMIDIMessage(message) {
		var frequency = midiNoteToFrequency(message.data[1]);
		console.log(frequency);
		if(message.data[0] === 144 && message.data[2] > 0){
			playNote(frequency);
		}
		if(message.data[0] === 128 || message.data[2] === 0){
			stopNote(frequency);
		}
	}
	function midiNoteToFrequency(note){
		return Math.pow(2, ((note - 69) / 12)) * 440;
	}
}

class Synthesizer extends Component {
  constructor(props) {
    super(props);
    this.receiveDispatch = this.receiveDispatch.bind(this);
		this.playSound = this.playSound.bind(this)
		this.stopSound = this.stopSound.bind(this)
    this.state = {
      		patch,
			synths: []
		}
		qwertyKeyboard(this.playSound)
		qwertyKeyboardKeyup(this.stopSound)
		initMidi(this.playSound, this.stopSound);
  }
  receiveDispatch(type, property, value, id) {
		if(id) {
			dispatches[type][property](value, this, id)
		} else {
			dispatches[type][property](value, this)
		}
  }

	playSound(keyFreq) {
		if(!KN_SYNTH) {
			KN_SYNTH = getConstructedSynthChain(this)
		}
		let oscillators = []
	  this.state.patch.oscillators.forEach(osc => {
	    let newOsc = audioContext.createOscillator()
	    newOsc.type = osc.type;
	    newOsc.frequency.value = keyFreq;
	    newOsc.detune.value = osc.detune;
	    newOsc.octave = osc.octave;
	    let newGain = audioContext.createGain()
	    newGain.value = osc.gain;
	    newOsc.connect(newGain);
	    newGain.connect(KN_SYNTH.filter);
			newOsc.start(audioContext.currentTime);
	    oscillators.push(newOsc)
	  });



	  KN_SYNTH.masterGain.connect(audioContext.destination);

		keyFreq = Math.ceil(keyFreq * 1000);
	  keysPressed[keyFreq] = {
			oscillators: oscillators
		}
	}

	stopSound(keyFreq) {
		keyFreq = Math.ceil(keyFreq * 1000);
		keysPressed[keyFreq].oscillators.forEach(osc => {
			osc.stop();
		})
		delete keysPressed[keyFreq];
	}

  render() {
    return (
      <div>
        <Layout patch={this.state.patch} sendDispatch={this.receiveDispatch}/>
      </div>
    );
  }
}

const keysPressed = {

}


function getConstructedSynthChain(component) {
	let synth = {
		oscillators: []
	};
	synth.filter = audioContext.createBiquadFilter();
	synth.filter.type = component.state.patch.filter.type;
	synth.filter.frequency.value = component.state.patch.filter.frequency;
	synth.filter.Q.value = component.state.patch.filter.Q;
	synth.filter.gain.value = component.state.patch.filter.gain;

	let sortedBus = component.state.patch.effectBus.slice().sort((a, b) => {
		return a.order - b.order;
	});

	let lastConnection = synth.filter;
	synth.effectBus = []
	sortedBus.forEach(effect => {
		let nextEffect = getConstrucedEffect(effect.type, effect);
		nextEffect.type = effect.type;

		lastConnection.connect(nextEffect);
		lastConnection = nextEffect;
		synth.effectBus.push(nextEffect)
	});

	let newCompressor = component.state.patch.compressor
	synth.compressor = new tuna.Compressor({newCompressor});

	lastConnection.connect(synth.compressor);
	synth.masterGain = audioContext.createGain();
	synth.masterGain.gain.value = component.state.patch.masterGain
	synth.compressor.connect(synth.masterGain);
	return synth;
}

function qwertyKeyboard(playSound) {
	window.addEventListener('keydown', event => {
		switch (event.code) {
			case 'KeyA':
				if(!keysPressed[Math.ceil(KeyFreqs.C3 * 1000)]) {
					playSound(KeyFreqs.C3);
				}
				break;
			case 'KeyW':
				if(!keysPressed[Math.ceil(KeyFreqs.C3Sharp * 1000)]) {
					playSound(KeyFreqs.C3Sharp);
				}
				break;
			case 'KeyS':
				if(!keysPressed[Math.ceil(KeyFreqs.D3 * 1000)]) {
					playSound(KeyFreqs.D3);
				}
				break;
			case 'KeyE':
				if(!keysPressed[Math.ceil(KeyFreqs.D3Sharp * 1000)]) {
					playSound(KeyFreqs.D3Sharp);
				}
				break;
			case 'KeyD':
				if(!keysPressed[Math.ceil(KeyFreqs.E3 * 1000)]) {
					playSound(KeyFreqs.E3);
				}
				break;
			case 'KeyF':
				if(!keysPressed[Math.ceil(KeyFreqs.F3 * 1000)]) {
					playSound(KeyFreqs.F3);
				}
				break;
			case 'KeyT':
				if(!keysPressed[Math.ceil(KeyFreqs.F3Sharp * 1000)]) {
					playSound(KeyFreqs.F3Sharp);
				}
				break;
			case 'KeyG':
				if(!keysPressed[Math.ceil(KeyFreqs.G3 * 1000)]) {
					playSound(KeyFreqs.G3);
				}
				break;
			case 'KeyY':
				if(!keysPressed[Math.ceil(KeyFreqs.G3Sharp * 1000)]) {
					playSound(KeyFreqs.G3Sharp);
				}
				break;
			case 'KeyH':
				if(!keysPressed[Math.ceil(KeyFreqs.A3 * 1000)]) {
					playSound(KeyFreqs.A3);
				}
				break;
			case 'KeyU':
				if(!keysPressed[Math.ceil(KeyFreqs.A3Sharp * 1000)]) {
					playSound(KeyFreqs.A3Sharp);
				}
				break;
			case 'KeyJ':
				if(!keysPressed[Math.ceil(KeyFreqs.B3 * 1000)]) {
					playSound(KeyFreqs.B3);
				}
				break;
			case 'KeyK':
				if(!keysPressed[Math.ceil(KeyFreqs.C4 * 1000)]) {
					playSound(KeyFreqs.C4);
				}
				break;
			default:
		}
	})
}

function qwertyKeyboardKeyup(stopSound) {
	window.addEventListener('keyup', event => {
		switch (event.code) {
			case 'KeyA':
				if(keysPressed[Math.ceil(KeyFreqs.C3 * 1000)]) {
					stopSound(KeyFreqs.C3);
				}
				break;
			case 'KeyW':
				if(keysPressed[Math.ceil(KeyFreqs.C3Sharp * 1000)]) {
					stopSound(KeyFreqs.C3Sharp);
				}
				break;
			case 'KeyS':
				if(keysPressed[Math.ceil(KeyFreqs.D3 * 1000)]) {
					stopSound(KeyFreqs.D3);
				}
				break;
			case 'KeyE':
				if(keysPressed[Math.ceil(KeyFreqs.D3Sharp * 1000)]) {
					stopSound(KeyFreqs.D3Sharp);
				}
				break;
			case 'KeyD':
				if(keysPressed[Math.ceil(KeyFreqs.E3 * 1000)]) {
					stopSound(KeyFreqs.E3);
				}
				break;
			case 'KeyF':
				if(keysPressed[Math.ceil(KeyFreqs.F3 * 1000)]) {
					stopSound(KeyFreqs.F3);
				}
				break;
			case 'KeyT':
				if(keysPressed[Math.ceil(KeyFreqs.F3Sharp * 1000)]) {
					stopSound(KeyFreqs.F3Sharp);
				}
				break;
			case 'KeyG':
				if(keysPressed[Math.ceil(KeyFreqs.G3 * 1000)]) {
					stopSound(KeyFreqs.G3);
				}
				break;
			case 'KeyY':
				if(keysPressed[Math.ceil(KeyFreqs.G3Sharp * 1000)]) {
					stopSound(KeyFreqs.G3Sharp);
				}
				break;
			case 'KeyH':
				if(keysPressed[Math.ceil(KeyFreqs.A3 * 1000)]) {
					stopSound(KeyFreqs.A3);
				}
				break;
			case 'KeyU':
				if(keysPressed[Math.ceil(KeyFreqs.A3Sharp * 1000)]) {
					stopSound(KeyFreqs.A3Sharp);
				}
				break;
			case 'KeyJ':
				if(keysPressed[Math.ceil(KeyFreqs.B3 * 1000)]) {
					stopSound(KeyFreqs.B3);
				}
				break;
			case 'KeyK':
				if(keysPressed[Math.ceil(KeyFreqs.C4 * 1000)]) {
					stopSound(KeyFreqs.C4);
				}
				break;
			default:
		}
	})
}

export default Synthesizer;

const dispatches = {
  oscillator: {
    waveform(value, component, id) {
			// let newSynths = [...component.state.synths]
			// newSynths.forEach(synth => {
			// 	synth.oscillators[id - 1].type = value;
			// })
		  let newPatch = {...component.state.patch}
			newPatch.oscillators = [...patch.oscillators]
			newPatch.oscillators[id - 1].type = value;
		  	component.setState({
			  patch: newPatch
		  })
    },
    gain(value, component, id) {
			// let newSynths = [...component.state.synths]
			// newSynths.forEach(synth => {
			// 	synth.oscillators[id - 1].gain.gain.value = value;
			// })
		  let newPatch = {...component.state.patch}
			newPatch.oscillators = [...patch.oscillators]
			newPatch.oscillators[id - 1].gain = value;
		  	component.setState({
			  patch: newPatch
		  })
    },
    detune(value, component, id) {
			// let newSynths = [...component.state.synths]
			// newSynths.forEach(synth => {
			// 	synth.oscillators[id - 1].osc.detune.value = value;
			// })
		  let newPatch = {...component.state.patch}
			newPatch.oscillators = [...patch.oscillators]
			newPatch.oscillators[id - 1].gain = value;
		  	component.setState({
			  patch: newPatch
		  })
    }
  },
  adsr: {
    attack(value, component) {
			// let newSynths = [...component.state.synths]
	  	//   	newSynths.forEach(synth => {
	  	// 	 	synth.adsr.attack = value;
	  	//   })
	  	  let newPatch = {...component.state.patch}
	  	  newPatch.adsr.attack = value;
	  	  component.setState({
	  		patch: newPatch
	  	})
    },
    decay(value, component) {
			// let newSynths = [...component.state.synths]
	  	//   	newSynths.forEach(synth => {
	  	// 	 	synth.adsr.decay = value;
	  	//   })
	  	  let newPatch = {...component.state.patch}
	  	  newPatch.adsr.decay = value;
	  	  component.setState({
	  		patch: newPatch
	  	})
    },
    sustain(value, component) {
			// let newSynths = [...component.state.synths]
	  	//   	newSynths.forEach(synth => {
	  	// 	 	synth.adsr.sustain = value;
	  	//   })
	  	  let newPatch = {...component.state.patch}
	  	  newPatch.adsr.sustain = value;
	  	  component.setState({
	  		patch: newPatch
	  	})
    },
    release(value, component) {
			// let newSynths = [...component.state.synths]
	  	//   	newSynths.forEach(synth => {
	  	// 	 	synth.adsr.release = value;
	  	//   })
	  	  let newPatch = {...component.state.patch}
	  	  newPatch.adsr.release = value;
	  	  component.setState({
	  		patch: newPatch
	  	})
    }
  },
  filter: {
    type: (value, component) => {
		// let newSynths = [...component.state.synths]
  	//   	newSynths.forEach(synth => {
  	// 	 synth.filter.type = value;
  	//   })
			KN_SYNTH.filter.type = value

  	  let newPatch = {...component.state.patch}
  	  newPatch.filter = {...newPatch.filter}
  	  newPatch.filter.type = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    frequency(value, component) {

			KN_SYNTH.filter.frequency.value = value;

	  	let newPatch = {...component.state.patch}
			newPatch.filter = {...patch.filter}
			newPatch.filter.frequency = value;
	  	component.setState({
		  	patch: newPatch
	  	})
    },
    Q: function(value, component) {

			KN_SYNTH.filter.Q.value = value;

		  let newPatch = {...component.state.patch}
		  newPatch.filter = {...patch.filter}
		  newPatch.filter.Q = value;
		  component.setState({
				patch: newPatch
			})
    },
    gain: function(value, component) {

			KN_SYNTH.filter.gain.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.filter = {...patch.filter}
  	  newPatch.filter.gain = value;
  	  component.setState({
  			patch: newPatch
  		})
    }
  },
  lfo: {
    type: function(input) {
      console.log("LFO type: ", input);
    },
    frequency: function(value) {
      console.log("LFO frequency: ", value);
    },
    modGain: function(value) {
      console.log("Mod Gain: ", value);
    }
  },
  compressor: {
    threshold(value, component) {

			KN_SYNTH.compressor.threshold = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.threshold = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    makeUpGain(value, component) {

			KN_SYNTH.compressor.makeupGaub.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.makeupGain = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    attack(value, component) {

			KN_SYNTH.compressor.attack.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.attack = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    release(value, component) {

			KN_SYNTH.compressor.release.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.release = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    ratio(value, component) {

			KN_SYNTH.compressor.ratio.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.ratio = value;
  	  component.setState({
  			patch: newPatch
  		})
    },
    knee(value, component) {

			KN_SYNTH.compressor.knee.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.knee = value;
  	  component.setState({
  			patch: newPatch
  		})
    },

		//////////// THIS ONE IS MISSING FROM COMPONENT
    autoMakeUp(value, component) {

			KN_SYNTH.compressor.autoMakeUp.value = value;

  	  let newPatch = {...component.state.patch}
  	  newPatch.compressor.autoMakeUp = value;
  	  component.setState({
  			patch: newPatch
  		})

		//////////////
    },


		/// THIS ONE IS MISSING TOO
    bypass: function(value) {
      console.log("compressor bypass: ", value);
    }
  },
  convolver: {
    highcut: function(value) {
      console.log("HC verb: ", value);
    },
    lowcut: function(value) {
      console.log("LC verb: ", value);
    },
    dryLevel: function(value) {
      console.log("dryLevel verb: ", value);
    },
    wetLevel: function(value) {
      console.log("wetLevel verb: ", value);
    },
    level: function(value) {
      console.log("Level verb: ", value);
    },
    bypass: function(value) {
      console.log("bypass verb: ", value);
    },
    order: function(value) {
      console.log("FX Order verb: ", value);
    }
  },
  ping_pong: {
    feedback: function(value, component) {
      // let newSynths = [...component.state.synths]
    	//   	newSynths.forEach(synth => {
      //       synth.effectBus.forEach(effect => {
      //         if (effect.type === 'ping_pong') {
      //           effect.feedback = value;
      //         }
      //       })
    	//   })
				KN_SYNTH.effectBus.forEach(effect => {
					if (effect.type === 'ping_pong') {
						effect.feedback = value;
					}
				})
    	  let newPatch = {...component.state.patch}
        newPatch.effectBus.forEach(effect => {
          if (effect.type === 'ping_pong') {
            effect.feedback = value;
          }
        })
    	  component.setState({
      		patch: newPatch
      	});
    },
    wet: function(value, component) {

				KN_SYNTH.effectBus.forEach(effect => {
					if (effect.type === 'ping_pong') {
						effect.wetLevel.gain.value = value;
					}
				})

    	  let newPatch = {...component.state.patch}
        newPatch.effectBus.forEach(effect => {
          if (effect.type === 'ping_pong') {
            effect.feedback = value;
          }
        })
    	  component.setState({
      		patch: newPatch
      	});
    },
    delay_left: function(value, component) {

				KN_SYNTH.effectBus.forEach(effect => {
					if (effect.type === 'ping_pong') {
						effect.delayTimeLeft = value;
					}
				})

    	  let newPatch = {...component.state.patch}
        newPatch.effectBus.forEach(effect => {
          if (effect.type === 'ping_pong') {
            effect.delayTimeLeft = value;
          }
        })
    	  component.setState({
      		patch: newPatch
      	});
    },
    delay_right: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'ping_pong') {
					effect.delayTimeRight = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'ping_pong') {
          effect.delayTimRight = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    order: function(value) {
      console.log("PING Order verb: ", value);
    }
  },
  phaser: {
    rate: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'phaser') {
					effect._rate = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'phaser') {
          effect.rate = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    depth: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'phaser') {
					effect._depth = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'phaser') {
          effect.depth = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    feedback: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'phaser') {
					effect._feedback = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'phaser') {
          effect.feedback = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    stereo_phase: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'phaser') {
					effect._stereoPhase = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'phaser') {
          effect.stereoPhase = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    // BMF: function(value, component) {
    //   let newSynths = [...component.state.synths]
    // 	  	newSynths.forEach(synth => {
    //         synth.effectBus.forEach(effect => {
    //           if (effect.type === 'phaser') {
    //             effect.baseModulationFrequency = value;
    //             console.log(effect);
    //           }
    //         })
    // 	  })
    // 	  let newPatch = {...component.state.patch}
    //     newPatch.effectBus.forEach(effect => {
    //       if (effect.type === 'phaser') {
    //         effect.baseModulationFrequency = value;
    //       }
    //     })
    // 	  component.setState({
    //   		patch: newPatch,
    //   		synths: newSynths
    //   	});
    // },
    bypass: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'phaser') {
					effect._bypass = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'phaser') {
          effect.bypass = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    order: function(value) {
      console.log("Phaser FX Order verb: ", value);
    }
  },
  overdrive: {
    drive: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'overdrive') {
					effect.inputDrive.gain.value = value;
				}
			})

      let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'overdrive') {
          effect.drive = value;
        }
      })

      component.setState({
        patch: newPatch
      });
    },
    output_gain: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'overdrive') {
					effect.outputDrive.gain.value = value;
				}
			})

      let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'overdrive') {
          effect.outputGain = value;
        }
      })

      component.setState({
        patch: newPatch
      });
    },
    curve_amount: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'overdrive') {
					effect._curveAmount = value;
				}
			})

      let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'overdrive') {
          effect.curveAmount = value;
        }
      })

      component.setState({
        patch: newPatch
      });
    },
    algorithm_index(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'overdrive') {
					effect._algorithmIndex= value;
				}
			})

      let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'overdrive') {
          effect.algorithmIndex = value;
        }
      })

      component.setState({
        patch: newPatch
      });
    },
    bypass(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'overdrive') {
					effect.bypass= value;
				}
			})

      let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'overdrive') {
          effect.bypass = value;
        }
      })

      component.setState({
        patch: newPatch
      });
    },
    order(value) {
      console.log("overdrive FX Order verb: ", value);
    }
  },
  moog_filter: {
    buffer: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'moog') {
					effect.buffer = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'moog') {
          effect.buffer = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    cutoff: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'moog') {
					effect.cutoff = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'moog') {
          effect.cutoff = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    res: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'moog') {
					effect.res = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'moog') {
          effect.res = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    order: function(value) {
      console.log("Moog FX Order verb: ", value);
    }
  },
  chorus: {
    feedback: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'chorus') {
					effect.feedback = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'chorus') {
          effect.feeback = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    delay: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'chorus') {
					effect.delay = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'chorus') {
          effect.delay = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    rate: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'chorus') {
					effect.rate = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'chorus') {
          effect.rate = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    bypass: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'chorus') {
					effect.bypass = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'chorus') {
          effect._bypass = value;
        }
      })

  	  component.setState({
    		patch: newPatch
    	});
    },
    order: function(value) {

    }
  },
  bitcrusher: {
    bits: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'bitcrusher') {
					effect.bits = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'bitcrusher') {
          effect.bits = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    buffer: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'bitcrusher') {
					effect.buffer = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'bitcrusher') {
          effect.bufferSize = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    norm_freq: function(value, component) {
      // let newSynths = [...component.state.synths]
    	//   	newSynths.forEach(synth => {
      //       synth.effectBus.forEach(effect => {
      //         if (effect.type === 'bitcrusher') {
      //           effect.norm_freq = value;
      //         }
      //       })
    	//   })
      //   console.log(newSynths);
    	//   let newPatch = {...component.state.patch}
      //   newPatch.effectBus.forEach(effect => {
      //     if (effect.type === 'bitcrusher') {
      //       effect.normfreq = value;
      //     }
      //   })
    	//   component.setState({
      // 		patch: newPatch,
      // 		synths: newSynths
      // 	});
    }
  },
  delay: {
    time: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.time = value;
				}
			});

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.delayTime = value;
        }
      });

  	  component.setState({
    		patch: newPatch
    	});
    },
    feedback: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.feedback = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.feedback = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    cutoff: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.cutoff = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.cutoff = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    dry: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.dry.gain.value = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.drylevel = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    bypass: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.bypass = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.wetLevel = value;
        }
      })
  	  component.setState({
    		patch: newPatch
    	});
    },
    wet: function(value, component) {

			KN_SYNTH.effectBus.forEach(effect => {
				if (effect.type === 'delay') {
					effect.wet.gain.value = value;
				}
			})

  	  let newPatch = {...component.state.patch}
      newPatch.effectBus.forEach(effect => {
        if (effect.type === 'delay') {
          effect.wetLevel = value;
        }
      })
			
  	  component.setState({
    		patch: newPatch
    	});
    }
  }
}

function getConstrucedEffect(type, data) {
  switch (type) {
    case 'bitcrusher':
      return new tuna.Bitcrusher(data);
    case 'overdrive':
      return new tuna.Overdrive(data);
    case 'filter':
      return new tuna.Filter(data);
    case 'convolver':
      return new tuna.Convolver(data);
    case 'tremolo':
      return new tuna.Tremolo(data);
    case 'delay':
      return new tuna.Delay(data);
    case 'chorus':
      return new tuna.Chorus(data);
    case 'moog':
      return new tuna.MoogFilter(data);
    case 'phaser':
      return new tuna.Phaser(data);
    case 'ping_pong':
      return new tuna.PingPongDelay(data);
    default:
      return type;
  }
}
