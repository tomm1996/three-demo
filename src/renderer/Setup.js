import '../../node_modules/three/build/three.js';
import '../../node_modules/three/examples/js/controls/PointerLockControls.js';

export default class Setup {
    constructor () {
        this.three = this.setupThree();
        this.scene = this.setupScene();
        this.renderer = this.setupRenderer();
        this.camera = this.setupCamera();
        this.admin = false;
    }
    setupThree () {
        return window.THREE;
    }
    setupScene () {
        let scene = new THREE.Scene();

        return scene;
    }
    setupRenderer () {
        let renderer = new THREE.WebGLRenderer( { antialias: true } );
        
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        return renderer
    }
    setupCamera () {
        let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight);
        
        camera.position.set(50, 50, 50);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }
}