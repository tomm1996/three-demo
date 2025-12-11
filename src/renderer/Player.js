import BaseClass from "./BaseClass.js"
import "../../node_modules/bezier-easing/dist/bezier-easing.min.js";

export default class Player extends BaseClass {
    CONTROLS = {
        'Forward': 'w',
        'Backward': 's',
        'Left': 'a',
        'Right': 'd',
        'Up': ' ',
        'Down': 'Control'
    };
    
    moving = new Map();
    speed = 1;
    g = 9.81;
    playerHeight = 3;
    constructor (checkIntersections) {
        super();
        this.createPlayer();
        this.setControls();
        this.addListeners();
        this.addToScene();
        this.checkIntersections = checkIntersections;
    }
    setControls () {
        this.controls.moveLeft = (speed) => {
            this.controls.moveRight(-speed);
        }
        this.controls.moveBackward = (speed) => {
            this.controls.moveForward(-speed);
        }
        
        this.controls.moveUp = (speed) => {
            if (this.admin) {
                this.fly(speed);
                return;
            }
            if (!this.jumping && !this.falling) {
                this.jump();
            }
        }
        
        this.controls.moveDown = (speed) => {           
            if (this.admin) {
                this.fly(-speed);
                return;
            }
        }
    }
    addListeners () {
        document.addEventListener('click', (ev) => {
            this.controls.lock();
        });
        window.addEventListener('keydown', (ev) => {
            for (let control in this.CONTROLS) {
                if (this.CONTROLS[control] === ev.key) {
                    this.moving.set(control, true);
                }
            }
        });
        window.addEventListener('keyup', (ev) => {
            for (let control in this.CONTROLS) {
                if (this.CONTROLS[control] === ev.key) {
                    this.moving.delete(control);
                }
            }
        });
        window.addEventListener("blur",() => {
            for (let control in this.CONTROLS) {
                this.moving.clear();
            }
        }, false);
    }
    createPlayer () {
        this.controls = new THREE.PointerLockControls(this.camera, this.renderer.domElement)
        this.playergeometry = new THREE.BoxGeometry(1, 1, 1);
        this.playermaterial = new THREE.MeshBasicMaterial({'color': 0xff0000});
        this.player = new THREE.Mesh(this.playergeometry, this.playermaterial);
        this.raycaster = new THREE.Raycaster();
    }
    move () {
        for (let control in this.CONTROLS) {
            if (this.moving.get(control)) {
                this.controls[`move${control}`](this.speed);
            }
        }
    }
    fly (speed) {
        this.camera.position.y += speed;
    }
    calculateFall (time) {
        const fallThreshold = 1 + this.playerHeight;
        const bezier = BezierEasing(0.7, 0.01, 1, 1);
        let framesUntilFullSpeed = 30;
        let fullSpeed = 1;

        if (this.jumping) {
            this.delayCount = 1;
            return;
        }
        
        const intersects = this.getIntersectionToFloor();

        if (intersects.length === 0) {
            this.lastIntersects = intersects;
            return;
        }
        if (intersects[0].distance < fallThreshold) {
            this.falling = false;
            this.camera.position.y = intersects[0].point.y + this.playerHeight + 0.5;
            return;
        }
        if (!this.falling) {
            this.falling = true;
            this.delayCount = 1;
        }

        this.camera.position.y -= fullSpeed * bezier(1 / (framesUntilFullSpeed / this.delayCount));
        if (this.delayCount < framesUntilFullSpeed) {
            this.delayCount += 1;
        }

    }
    getIntersectionToFloor () {
        const down = new THREE.Vector3( 0, -1, 0 );
		const position = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z);
		this.raycaster.set(position, down);
		return this.raycaster.intersectObjects(this.checkIntersections);
    }
    jump () {
        this.jumping = true;
        this.jumpStrength = 1;
        this.jumpDuration = 10;
        this.decreaseDuration = 5;
        this.decreaseFrame = this.decreaseDuration;
        this.frame = 0;
    }
    calculateJump () {
        if (!this.jumping) {
            return;
        }
        const bezier = BezierEasing(0.6, 0.28, 1, 1);

        if (this.decreaseFrame > 1) {
            this.jumpStrength = this.jumpStrength - this.jumpStrength * 0.1;
            if (this.frame > this.jumpDuration) {
                this.decreaseFrame -= 1;
            }
            this.camera.position.y += this.jumpStrength * bezier(1 / (this.decreaseDuration / this.decreaseFrame));
            this.frame++;
            return; 
        }
        this.jumping = false;
        this.falling = true;
    }
    addToScene () {
        this.scene.add(this.player);
    }
    update (time) {
        this.lastPosition = new THREE.Vector3().copy(this.camera.position);
        this.deltaTime = time - this.lastTime || 0;
        this.lastTime = time;
        this.move();        
        this.direction = new THREE.Vector3().subVectors(this.camera.position, this.lastPosition).normalize();

        if (!this.admin) {
            this.calculateJump();
            this.calculateFall(time);
        }

        this.player.position.copy(this.camera.position);
        this.player.rotation.copy(this.camera.rotation);
    }
}