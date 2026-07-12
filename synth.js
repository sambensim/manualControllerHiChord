// synth.js
// Defines a custom Tone.js instrument and exposes simple trigger functions.
// No gamepad or input logic here — just sound design.

let synth;
let filter;
let reverb;
let phaser;
let env;
let vibrato;

function createSynth() {
    // let effects = []
    vibrato = new Tone.Vibrato(5, 0)
    filter = new Tone.Filter(1200, "lowpass");
    filter.Q.value = 10.1
    env = new Tone.Envelope({
        attack: 0.1,
        decay: 10.2,
        sustain: 0.0,
        release: 10.8,
    })
    const scale = new Tone.Scale(200, 3000);
    env.connect(scale);
    // scale.connect(filter.frequency);
    reverb = new Tone.Reverb({ decay: 2, wet: 0 });
    phaser = new Tone.Phaser({
      frequency: 0.2,
      octaves: 5,
      baseFrequency: 2000
    });

    synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "fatsawtooth", // detuned stack of sawtooths, fuller than a plain saw
        count: 3,
        spread: 20
    },
    envelope: {
        attack: 0.0,
        decay: 3,
        sustain: 1.0,
        release: 0
    }
  });
//   synth.maxPolyphony(8)
  synth.chain(filter, reverb, phaser, vibrato, Tone.Destination);
  synth.volume.value = -12
  return synth;
}

function noteOn(note, velocity = 1) {
  if (!synth) createSynth();
  synth.triggerAttack(note, undefined, velocity);
}

function noteOff(note) {
  if (!synth) return;
  synth.triggerRelease(note);
}

// function setFilterCutoff(freq) {
//   if (!filter) return;
//   filter.frequency.rampTo(freq, 0.05);
// }

// function setFilterQ(q) {
//   if (!filter) return;
//   filter.Q.rampTo(q, 0.05);
// }