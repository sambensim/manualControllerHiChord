// main.js

const CONTROLLERINDEX = 1 //this is bad and lazy
let playMode = "CHORD" //CHORD, STRUM, LEAD, ARP, REPEAT
// let cChordNoteIndex = 0
let = waitTime = 400

function mainLoop() {
    const leftTrigger = controller.getButtonValue(6, CONTROLLERINDEX) || 0;
    const rightTrigger = controller.getButtonValue(7, CONTROLLERINDEX) || 0;
    if (filter) {
        filter.frequency.rampTo(Math.max(2400 - 2000 * leftTrigger, 1e-4), 0.05);
        vibrato.depth.rampTo(Math.max(0.5 * rightTrigger, 1e-4), 0.05);
    }
    requestAnimationFrame(mainLoop);
}
let beatTriggered = []
function beat() {
    // console.log(beatTriggered.length)
    for (f of beatTriggered) {
        f()
    }
    window.setTimeout(beat, waitTime)
}

beat()
requestAnimationFrame(mainLoop);


const controller = new GamepadController({
  buttons: {
    5: { onDown: (value, index) => trigger(index), onUp: () => pass() },
    12: { onDown: (value, index) => octave += 1, onUp: (value, index) => updateText(index) },
    13: { onDown: (value, index) => octave -= 1, onUp: (value, index) => updateText(index) },
    14: { onDown: (value, index) => changeKey(((key + 12) - 1) % 12), onUp: (value, index) => updateText(index) },
    15: { onDown: (value, index) => changeKey((key + 1) % 12), onUp: (value, index) => updateText(index) },
    //holding circle makes left joystick select play modes. play mode is changed when circle is released
    //holding x makes left joystick select instruments. instrument mode is changed when x is released
    //holding square makes left joystick select autoplay speed (only does things in certain play modes). instrument mode is changed when square is released
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
    currentlyPlaying = getChordText(chordIndex, chordMode)
    cChordNoteIndex = 0
    if (chordIndex == -1) {
        unPressAll()
        beatTriggered.length = 0
    } else {
        playChord(chordIndex, chordMode)
    }
}

function playChord(chordIndex, chordMode, velocity = 1) {
    env.triggerAttackRelease(0.1)
    notes = getChordNotes(chordIndex, chordMode)
    unPressAll()
    beatTriggered.length = 0;
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
}
window.addEventListener("pointerdown", startAudio, { once: true });
window.addEventListener("keydown", startAudio, { once: true });