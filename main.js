// main.js

window.RCadeInput = {
  register_classic: async (cb) => {
	const classic_channel = await PluginChannel.acquire("@rcade/input-classic", "^1.0.0");
	classic_channel.getPort().addEventListener('message', cb);
  },
  register_spinners: async (cb) => {
	const spinner_channel = await PluginChannel.acquire("@rcade/input-spinners", "^1.0.0");
	spinner_channel.getPort().addEventListener('message', cb);
  }
};

let playModeIndex = 0
let tempoIndex = 2
const PLAYMODES = ["CHORD", "STRUM", "LEAD", "ARP", "REPEAT"]
const CONTROLLERINDEX = 1 //this is bad and lazy
const TEMPOS = [10, 60, 80, 120, 180, 240]

let initialState = {
    left: false,
    right: false,
    up: false,
    down: false,
    a: false,
    b: false
}

let joystickState = [{...initialState}, {...initialState}]

window.RCadeInput.register_classic(on_classic).then(() => {
startAudio()
playChord(0, 0)
});


function on_classic({data}) {
    let {type, player, button, pressed} = data
    if (type === "button") {
        joystickState[player - 1][button] = pressed
    }
    tryUpdate()
}

function getOctant(player) {
    const {up, down, left, right} = joystickState[player]
    const count = left + right + up + down;
    switch (count) {
        case 0:
            return 0
        case 1:
            if (up) 
                return 1;
            if (right) 
                return 3;
            if (down) 
                return 5;
            if (left) 
                return 7;
        case 2:
             if (up && right) 
                return 2;
            if (right && down) 
                return 4;
            if (down && left) 
                return 6;
            if (left && up) 
                return 8;
    }
}

function tryUpdate() {
    trigger()
    updateText(index)
}

function mainLoop() {
    // const leftTrigger = controller.getButtonValue(6, CONTROLLERINDEX) || 0;
    // const rightTrigger = controller.getButtonValue(7, CONTROLLERINDEX) || 0;
    // if (filter) {
        // filter.frequency.rampTo(Math.max(2400 - 2000 * leftTrigger, 1e-4), 0.05);
        // vibrato.depth.rampTo(Math.max(0.5 * rightTrigger, 1e-4), 0.05);
    // }
    requestAnimationFrame(mainLoop);
}

let beatTriggered = []
function beat() {
    // console.log(beatTriggered.length)
    for (f of beatTriggered) {
        f()
    }
    let bpm = TEMPOS[tempoIndex]
    let waitTime = 1000.0 / bpm * 60.0
    window.setTimeout(beat, waitTime)
}


function trigger() {
    // playChord(0, 0)
    let chordMode = controller.getOctant(0)-1
    let chordIndex = controller.getOctant(1)-1
    gotit = `i got: ${chordTypeDict[chordIndex]}, ${chordModeDict[chordMode]}`
    debugDraw();
    currentlyPlaying = getChordText(chordIndex, chordMode)
    cChordNoteIndex = 0
    if (chordIndex == -1) {
        unPressAll()
        beatTriggered.length = 0
    } else {
        playChord(chordIndex, chordMode)
    }
}


beat()
requestAnimationFrame(mainLoop);


// const controller = new GamepadController({
//   buttons: {
//     // 0: //cross
//     1: { onDown: (value, index) => playModeIndex = (playModeIndex + 1) % PLAYMODES.length, onUp: () => pass() }, //circle
//     2: { onDown: (value, index) => tempoIndex = (tempoIndex + 1) % TEMPOS.length, onUp: () => pass() },//square
//     // 3: //triangle
//     // 5: { onDown: (value, index) => trigger(index), onUp: () => pass() },
//     12: { onDown: (value, index) => octave += 1, onUp: (value, index) => updateText(index) },
//     13: { onDown: (value, index) => octave -= 1, onUp: (value, index) => updateText(index) },
//     14: { onDown: (value, index) => changeKey(((key + 12) - 1) % 12), onUp: (value, index) => updateText(index) },
//     15: { onDown: (value, index) => changeKey((key + 1) % 12), onUp: (value, index) => updateText(index) },
//     //TODO - holding circle makes left joystick select play modes. play mode is changed when circle is released
//     //TODO - holding cross makes left joystick select instruments. instrument mode is changed when cross is released
//     //TODO - holding square makes left joystick select autoplay speed (only does things in certain play modes). speed is changed when square is released
//     //TODO - holding triangle and a trigger makes left joystick select trigger effect. speed is changed when triangle is released
//   },
//   axes: {
//     0: (value, index) => updateText(index),
//     1: (value, index) => updateText(index),
//     2: (value, index) => updateText(index),
//     3: (value, index) => updateText(index),
//   }
// });

// function pass() { return }

// function trigger(gpIndex) {
//     let chordMode = controller.getStickSection(0, 1, 8, gpIndex)
//     let chordIndex = controller.getStickSection(2, 3, 8, gpIndex)
//     currentlyPlaying = getChordText(chordIndex, chordMode)
//     cChordNoteIndex = 0
//     if (chordIndex == -1) {
//         unPressAll()
//         beatTriggered.length = 0
//     } else {
//         playChord(chordIndex, chordMode)
//     }
// }

function playChord(chordIndex, chordMode, velocity = 1) {
    env.triggerAttackRelease(0.1)
    notes = getChordNotes(chordIndex, chordMode)
    unPressAll()
    beatTriggered.length = 0;
    let playMode = PLAYMODES[playModeIndex]
    switch (playMode) {
        case "CHORD":
            for (let note of notes) {
                recentDown.push([note, frameCount])
                noteStack.push(note)
                noteOn(note);
            }
            break;
        case "LEAD":
            let note = notes[0]
            recentDown.push([note, frameCount])
            noteStack.push(note)
            noteOn(note);
            break;
        case "STRUM":
            cChordNoteIndex = 0
            function playNextNoteStrum() {
                unPressAll()
                if (cChordNoteIndex <= notes.length) {
                    let note = notes[cChordNoteIndex]
                    recentDown.push([note, frameCount])
                    noteStack.push(note)
                    noteOn(note);
                    cChordNoteIndex += 1
                }
            }
            beatTriggered.push(playNextNoteStrum)
            break;
        case "ARP":
            cChordNoteIndex = 0
            function playNextNoteArp() {
                unPressAll()
                let note = notes[cChordNoteIndex]
                recentDown.push([note, frameCount])
                noteStack.push(note)
                noteOn(note);
                cChordNoteIndex += 1
                cChordNoteIndex %= notes.length
            }
            beatTriggered.push(playNextNoteArp)
            break;
        case "REPEAT":
            on = true
            function playNextNoteRepeat() {
                unPressAll()
                if (on) {
                    for (let note of notes) {
                        recentDown.push([note, frameCount])
                        noteStack.push(note)
                        noteOn(note);
                    }
                }
                on = !on
            }
            beatTriggered.push(playNextNoteRepeat)
            break;
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
  updateText()
}
// window.addEventListener("pointerdown", startAudio, { once: true });
// window.addEventListener("keydown", startAudio, { once: true });