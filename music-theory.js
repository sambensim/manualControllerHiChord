const chordTypeDict = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  min7b5: [0, 3, 6, 10],
  majadd9: [0, 4, 7, 14],
  minadd9: [0, 3, 7, 14],
  dimadd9: [0, 3, 6, 14],
  sus4: [0, 5, 7],
  maj6: [0, 4, 7, 9],
  sus2: [0, 2, 7],
  aug: [1, 4, 8]
};

const chordModeDict = {
    [-1]: ["maj", "min", "min", "maj", "maj", "min", "dim"], //Base
    6: ["min", "maj", "maj", "min", "min", "maj", "min"], //Up
    7: ["dom7", "dom7", "dom7", "dom7", "dom7", "dom7", "dom7"], //Up Right
    0: ["min7", "maj7", "maj7", "min7", "min7", "maj7", "min7b5"], //you got it
    1: ["majadd9", "minadd9", "minadd9", "majadd9", "majadd9", "minadd9", "dimadd9"],
    2: ["sus4", "sus4", "sus4", "sus4", "sus4", "sus4", "sus4"],
    3: ["maj6", "sus2", "sus2", "maj6", "maj6", "sus2", "sus2"],
    4: ["dim", "dim", "dim", "dim", "dim", "dim", "dim"],
    5: ["aug", "aug", "aug", "aug", "aug", "aug", "aug"]
}

const playModes = {}

const AllNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let keyNotes = [];
let key
let octave = 3

let noteStack = []
// let lastChord = null
// let playing = false


function changeKey(newKey) {
    key = newKey
    keyNotes = []
    for (offset of [0, 2, 4, 5, 7, 9, 11]) {
        keyNotes.push(AllNotes[(key + offset) % 12])
    }
}

// function setChordMode(mode) {
//     chordMode = mode
//     // if (playing) {
//     //     playChord(lastChord)
//     // }
// }

function noteAdd(note, diff) {
    let ni = note + diff
    let bo = octave
    while (ni >= 12) {
        ni -= 12;
        bo += 1
    }
    return AllNotes[ni] + String(bo)
}

function formNote(note) {
    return AllNotes[note] + String(octave)
}

function keyNoteAllNoteIndex(keyNoteIndex) {
    let majorArray = [0, 2, 4, 5, 7, 9, 11]
    return majorArray[keyNoteIndex]
}

function getChordNotes(chordIndex, chordMode) {
    let out = []
    // console.log("cm: " + chordMode)
    // console.log("cmd: " + chordModeDict[chordMode])
    // console.log("ctd: " + chordTypeDict[chordModeDict[chordMode]])
    // console.log("ci: " + chordIndex)
    let chordModeString = chordModeDict[chordMode][chordIndex % 7]
    let octaveShift = 12 * Math.floor(chordIndex / 7)
    let rootOffset = keyNoteAllNoteIndex(chordIndex % 7) + octaveShift
    for (offset of chordTypeDict[chordModeString]) {
        out.push(noteAdd(key, rootOffset + offset))
    }
    // console.log(out)
    return out
}

function noteToValue(note) {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);

  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = AllNotes.indexOf(name);

  if (noteIndex === -1) throw new Error(`Invalid note name: ${name}`);

  return octave * 12 + noteIndex;
}

function getChordName(chordIndex, chordMode) {
    // console.log("ci: " + chordIndex)
    // console.log("cm: " + chordMode)
    let octaveShift = 12 * Math.floor(chordIndex / 7)
    let note = noteAdd(key, keyNoteAllNoteIndex(chordIndex % 7) + octaveShift)
    let chordModeString = chordModeDict[chordMode][chordIndex % 7]
    return note + chordModeString
}