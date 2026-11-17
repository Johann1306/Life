// ============================================================
// Keyboard Input Manager — event registration + boolean state
// ============================================================

class InputManager {
    constructor() {
        this.state = {};
        this.jumpPressed = false;
        this._keyState = {};
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup',   (e) => this._onKeyUp(e));
    }

    _onKeyDown(e) {
        const action = KEY_MAP[e.code];
        if (!action) return;
        e.preventDefault();
        // Track individual key state to detect new key presses
        const wasPressed = this._keyState[e.code];
        this._keyState[e.code] = true;
        if (!wasPressed) {
            this.state[action] = true;
            // Only set jumpPressed when a jump key is pressed, not any key
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'KeyZ') {
                this.jumpPressed = true;
            }
        }
    }

    _onKeyUp(e) {
        const action = KEY_MAP[e.code];
        if (!action) return;
        e.preventDefault();
        this._keyState[e.code] = false;
        this.state[action] = false;
    }

    isPressed(actionName) {
        return !!this.state[actionName];
    }

    consumeJump() {
        const consumed = this.jumpPressed;
        this.jumpPressed = false;
        return consumed;
    }

    resetFrame() {
        // Do NOT clear jumpPressed here — it must persist until consumeJump()
        // is called. If Mario is airborne when the user presses Space, the
        // jump press would be lost before Mario lands.
    }
}
