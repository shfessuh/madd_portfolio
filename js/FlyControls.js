/**
 * @author James Baicoianu / http://www.baicoianu.com/
 * Originally from http://threejs.org/examples/js/controls/FlyControls.js
 * Modified to support keyboard arrows as a fake gamepad.
 */


THREE.FlyControls = function(object) {
    this.object = object;

    // API
    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;

    // disable default target object behavior
    this.object.useQuaternion = true;

    // internals
    this.tmpQuaternion = new THREE.Quaternion();

    this.moveState = {
      up: 0, down: 0, left: 0, right: 0,
      forward: 0, back: 0,
      pitchUp: 0, pitchDown: 0,
      yawLeft: 0, yawRight: 0,
      rollLeft: 0, rollRight: 0
    };
    this.moveVector = new THREE.Vector3(0, 0, 0);
    this.rotationVector = new THREE.Vector3(0, 0, 0);

    this.handleEvent = function(event) {
        if (typeof this[event.type] === 'function') {
            this[event.type](event);
        }
    };

    // Overwritten update to handle real or fake gamepad
    this.update = function(delta) {
        // 1) Grab the first real Gamepad (if any)
        var realGP = (navigator.getGamepads ? navigator.getGamepads()[0] : null);
        // 2) Fallback fake gamepad based on arrow keys
        var gamepad = realGP || { axes: [0,0,0,0], buttons: [] };
        if (!realGP) {
            gamepad.axes[2] = (keyState.ArrowLeft  ? -1 : 0) + (keyState.ArrowRight ?  1 : 0);
            gamepad.axes[3] = (keyState.ArrowUp    ? -1 : 0) + (keyState.ArrowDown  ?  1 : 0);
        }

        // 3) Map gamepad inputs to moveState
        this.moveState.yawLeft   = -gamepad.axes[2];
        this.moveState.pitchDown =  gamepad.axes[3];
        this.moveState.rollLeft  = (Math.abs(gamepad.axes[0]) < 0.15 ? 0 : (this._watchForJoystickRoll && gamepad.axes[0]))
                                 || ((gamepad.buttons[15]||0)/2);
        this.moveState.rollRight = (Math.abs(gamepad.axes[1]) < 0.15 ? 0 : (this._watchForJoystickRoll && gamepad.axes[1]))
                                 || ((gamepad.buttons[14]||0)/2);

        // 4) Existing rotation & movement logic
        this.updateRotationVector();
        var moveMult = delta * this.movementSpeed;
        var rotMult  = delta * this.rollSpeed;

        this.object.translateX(this.moveVector.x * moveMult);
        this.object.translateY(this.moveVector.y * moveMult);
        this.object.translateZ(this.moveVector.z * moveMult);

        this.tmpQuaternion.set(
            this.rotationVector.x * rotMult,
            this.rotationVector.y * rotMult,
            this.rotationVector.z * rotMult,
            1
        ).normalize();
        this.object.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector
        this.object.rotation.setFromQuaternion(
    this.object.quaternion,
    this.object.eulerOrder
);
    };

    this.updateRotationVector = function() {
        this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (-this.moveState.yawRight  + this.moveState.yawLeft);
        this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
    };

    // initialize
    this.updateRotationVector();
};
