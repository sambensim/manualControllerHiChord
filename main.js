// main.js

const CONTROLLERINDEX = 1 //this is bad and lazy

function mainLoop() {
    const leftTrigger = controller.getButtonValue(6, CONTROLLERINDEX) || 0;
    const rightTrigger = controller.getButtonValue(7, CONTROLLERINDEX) || 0;
    if (filter) {
        filter.frequency.rampTo(Math.max(2400 - 2000 * leftTrigger, 1e-4), 0.05);
        vibrato.depth.rampTo(Math.max(0.5 * rightTrigger, 1e-4), 0.05);
    }
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);




const controller = new GamepadController({
  buttons: {
    5: { onDown: (value, index) => trigger(index), onUp: () => pass() },
    12: { onDown: (value, index) => octave += 1, onUp: (value, index) => updateText(index) },
    13: { onDown: (value, index) => octave -= 1, onUp: (value, index) => updateText(index) },
    14: { onDown: (value, index) => changeKey(((key + 12) - 1) % 12), onUp: (value, index) => updateText(index) },
    15: { onDown: (value, index) => changeKey((key + 1) % 12), onUp: (value, index) => updateText(index) },
  },
  axes: {
    0: (value, index) => updateText(index),
    1: (value, index) => updateText(index),
    2: (value, index) => updateText(index),
    3: (value, index) => updateText(index),
  }
});

function pass() { return }

function trigger(gpIndex) {
    let chordMode = controller.getStickSection(0, 1, 8, gpIndex)
    let chordIndex = controller.getStickSection(2, 3, 8, gpIndex)
    // console.log("mode: " + chordMode + "\nindex: " + chordIndex)
    currentlyPlaying = getChordText(chordIndex, chordMode)
    if (chordIndex == -1) {
        unPressAll()
    } else {
        playChord(chordIndex, chordMode)
    }
}

function playChord(chordIndex, chordMode, velocity = 1) {
    env.triggerAttackRelease(0.1)
    // lastChord = chord
    // playing = true
    notes = getChordNotes(chordIndex, chordMode)
    unPressAll()
    // console.log(notes)
    for (note of notes) {
        recentDown.push([note, frameCount])
        noteStack.push(note)
        noteOn(note);
    }
}

function unPressAll() {
    for (note of noteStack) {
        recentUp.push(frameCount)
        noteOff(note)
    }
    noteStack = []
}



async function startAudio() {
  await Tone.start();
  createSynth();
  changeKey(0)
  console.log("Audio context started");
}
window.addEventListener("pointerdown", startAudio, { once: true });
window.addEventListener("keydown", startAudio, { once: true });

// window.addEventListener("gamepadbuttondown", (e) => {
//     let chord = buttonChord[e.detail.button];
//     if (chord == undefined || (chord < 0 || chord > 6) || (chord == "octDown" || chord == "octUp")) {
//         return
//     }
//     playChord(chord, e.detail.value)
// });

// window.addEventListener("gamepadbuttonup", (e) => {
//     console.log(e.detail.button)
//     let chord = buttonChord[e.detail.button];
//     if (chord == undefined || (chord < 0 || chord > 6)) {
//         return
//     } else if (chord == "octDown") {
//         octave -= 1
//         return
//     } else if (chord == "octUp") {
//         octave += 1
//         return
//     }
//     // playing = false
//     notes = getChordNotes(chord)
//     for (note of notes) {
//         recentUp.push(frameCount)
//         noteOff(note);
//     }
// });

// window.addEventListener("gamepadaxismove", (e) => {
//     const [stickX, stickY] = e.detail.axes;
//     let oct = vectorToOctant(stickX, stickY)
//     // console.log(oct)
//     if (oct != chordMode) {
//         changeChordMode(oct)
//     }
// });