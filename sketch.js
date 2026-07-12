let recentDown = []
let recentUp = []

function setup() {
  createCanvas(windowWidth, windowHeight);
}

let windowFrameCountSize = 700
let cLeftFrame = -windowFrameCountSize

function draw() {
    background(255)
    text(noteText, 50, 50);
}

let noteText = ""
let currentlyPlaying = "none"
function updateText(gpIndex) {
    let playing = "playing: " + currentlyPlaying
    let baseInfo = "key: " + AllNotes[key] + "\noctave: " + octave
    let chordMode = controller.getStickSection(0, 1, 8, gpIndex)
    let chordIndex = controller.getStickSection(2, 3, 8, gpIndex)
    noteText = playing + "\nselected: " + getChordText(chordIndex, chordMode) + "\n" + baseInfo
}

function getChordText(chordIndex, chordMode) {
    if (chordIndex == -1) {
        return "none"
    }
    const rms = ["i", "ii", "iii", "iv", "v", "vi", "vii"]
    let cirm = rms[chordIndex % 7]
    if (chordModeDict[chordMode][chordIndex % 7].includes("maj")) {
        cirm = cirm.toUpperCase()
    }
    return getChordName(chordIndex, chordMode) + " (" + cirm + ")"
}

function pianoroll() {
    for (let i = 0; i < recentDown.length; i += 1) {
        let n = recentDown[i]
        if (i < recentUp.length - 1) {
            line(n[1] - cLeftFrame, height - (noteToValue(n[0]) - 10) * 10, recentUp[i] - cLeftFrame, height - (noteToValue(n[0]) - 10) * 10)
        } else {
            line(n[1] - cLeftFrame, height - (noteToValue(n[0]) - 10) * 10, width * 1.1, height - (noteToValue(n[0]) - 10) * 10)
        }
        cLeftFrame = frameCount - windowFrameCountSize
    }
    while (recentDown.length > 0 && recentDown[0][1] < cLeftFrame) {
        recentDown.shift()
        recentUp.shift()
    }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;