// gamepad-input.js
const DEBUG = false;

class GamepadController {
  constructor(config) {
    if (!config) {
      console.error("GamepadController: no config provided. Controller will not be initialized.");
      this.config = null;
    } else {
      this.config = config;
    }

    this.prevButtonStates = {};
    this.activeIndices = new Set();
    this.latestGamepads = {}; // index -> raw Gamepad object, updated every frame

    window.addEventListener("gamepadconnected", (e) => {
      console.log(`Controller connected: ${e.gamepad.id} (index ${e.gamepad.index})`);
      this._poll(e.gamepad.index);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log(`Controller disconnected: ${e.gamepad.id}`);
      this.activeIndices.delete(e.gamepad.index);
      delete this.latestGamepads[e.gamepad.index];
    });
  }

  _poll(index) {
    this.activeIndices.add(index);

    const loop = () => {
      if (!this.activeIndices.has(index)) return;

      const gp = navigator.getGamepads()[index];
      if (!gp) {
        requestAnimationFrame(loop);
        return;
      }

      this.latestGamepads[index] = gp; // cache for on-demand reads

      if (DEBUG) {
        console.log(`[gamepad ${index}] buttons:`, gp.buttons.map(b => b.value));
        console.log(`[gamepad ${index}] axes:`, gp.axes);
      }

      if (this.config) {
        this._handleButtons(index, gp);
        this._handleAxes(index, gp);
      }

      requestAnimationFrame(loop);
    };
    loop();
  }

  _handleButtons(index, gp) {
    const buttonConfig = this.config.buttons;
    if (!buttonConfig) return;

    gp.buttons.forEach((button, i) => {
      const key = `${index}:${i}`;
      const wasPressed = this.prevButtonStates[key] || false;
      const isPressed = button.pressed || button.value > 0.5;

      const mapping = buttonConfig[i];
      if (mapping) {
        if (isPressed && !wasPressed && mapping.onDown) mapping.onDown(button.value, index);
        if (!isPressed && wasPressed && mapping.onUp) mapping.onUp(button.value, index);
        if (isPressed && mapping.onHold) mapping.onHold(button.value, index);
      }

      this.prevButtonStates[key] = isPressed;
    });
  }

  _handleAxes(index, gp) {
    const axesConfig = this.config.axes;
    if (!axesConfig) return;

    gp.axes.forEach((value, i) => {
      const mapping = axesConfig[i];
      if (mapping) mapping(value, index);
    });
  }

  // --- On-demand state reads, usable from inside any callback ---

  getButtonValue(buttonIndex, gamepadIndex = 0) {
    const gp = this.latestGamepads[gamepadIndex];
    if (!gp || !gp.buttons[buttonIndex]) return 0;
    return gp.buttons[buttonIndex].value;
  }

  isButtonPressed(buttonIndex, gamepadIndex = 0) {
    const gp = this.latestGamepads[gamepadIndex];
    if (!gp || !gp.buttons[buttonIndex]) return false;
    const b = gp.buttons[buttonIndex];
    return b.pressed || b.value > 0.5;
  }

  getAxisValue(axisIndex, gamepadIndex = 0) {
      const gp = this.latestGamepads[gamepadIndex];
      if (!gp) return 0;
    return gp.axes[axisIndex] || 0;
  }

  getStickSection(hAxisIndex, vAxisIndex, divisions = 8, gamepadIndex = 0) {
    let x = this.getAxisValue(hAxisIndex, gamepadIndex)
    let y = this.getAxisValue(vAxisIndex, gamepadIndex)
    const magnitude = Math.sqrt(x * x + y * y);
    const THRESHOLD = 0.4;
    if (magnitude < THRESHOLD) return -1;
    const angle = Math.atan2(y, x);
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    const octant = Math.round(normalizedAngle / ((2 * Math.PI) / divisions)) % divisions;
    return octant;
  }
}