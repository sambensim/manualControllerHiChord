let recentDown = []
let recentUp = []

let ready = false

function setup() {
    ready = true
  createCanvas(windowWidth, windowHeight);
}

let windowFrameCountSize = 700
let cLeftFrame = -windowFrameCountSize

function draw() {
    background(255)
    text("okokokok", width/2, height/10)
    text(noteText, 50, 50);
    debugDraw();
}

let gotit = ""
function debugDraw() {
    background(255);
    text(gotit, windowWidth/2, windowHeight/2);
}

let noteText = ""
let currentlyPlaying = "none"
function updateText() {
    if (ready) {
        let playing = "playing: " + currentlyPlaying
        let baseInfo = "key: " + AllNotes[key] + "\noctave: " + octave
        let chordMode = getOctant(0)
        let chordIndex = getOctant(1)
        noStroke()
        fill(0)
        noteText = playing + "\nselected: " + getChordText(chordIndex, chordMode) + "\n" + baseInfo + "\nplay mode: " + PLAYMODES[playModeIndex] + "\n " + TEMPOS[tempoIndex] + " bpm\n"
    }
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

const JOYSTICKDIST = 25
function joysticks() {
    let centerx = width/3
    let centery = height/3*2
    let x1 = JOYSTICKDIST*controller.getAxisValue(0, CONTROLLERINDEX)+centerx
    let y1 = JOYSTICKDIST*controller.getAxisValue(1, CONTROLLERINDEX)+centery
    noFill()
    stroke(0)
    circle(centerx, centery, 60)
    line(centerx, centery, x1, y1)
    centerx = width/3*2
    let x2 = JOYSTICKDIST*controller.getAxisValue(2, CONTROLLERINDEX)+centerx
    let y2 = JOYSTICKDIST*controller.getAxisValue(3, CONTROLLERINDEX)+centery
    circle(centerx, centery,60)
    line(centerx, centery, x2, y2)
    fill(0, 0, 255)
    circle(x1, y1, 10)
    circle(x2, y2, 10)
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;