import BaseClass from './BaseClass.js';
import Player from './Player.js';
import Terrain from './Terrain.js';
import '../../node_modules/three/examples/js/objects/Reflector.js';
export default class World extends BaseClass {
    worldObjects = {};
    constructor () {
        super();
        window.scene = this.scene;
        this.setupGraphics();
        this.addObjects();
        this.render();
    }
    
    
    setupGraphics () {
        let d = 50;
        let hemiLight = new this.THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        let dirLight = new this.THREE.DirectionalLight( 0xffffff , 1);
        let dirLightHelper = new this.THREE.DirectionalLightHelper(dirLight);
        this.scene.background = new this.THREE.Color( 0xbfd1e5 );

        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );

        dirLight.position.set( 0, 1, 0 );
        dirLight.position.multiplyScalar( 100 );
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;


        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 13500;

        this.renderer.shadowMap.enabled = true;
        // this.scene.add( hemiLight );
        this.scene.add( dirLight, dirLightHelper );
    }
    addObjects () {
        const position = {x: 0, y: 0, z: 0}
        const scale = {x: 200, y: 1, z: 200}
        
        const geometry = new THREE.PlaneGeometry( 100, 100 );
        const verticalMirror = new THREE.Reflector( geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x889999
        } );
        verticalMirror.position.y = 50;
        verticalMirror.position.z = - 50;
        this.scene.add(verticalMirror);
        this.scene.add(this.camera);
        this.worldObjects.terrain = new Terrain({position, scale});
        this.worldObjects.player = new Player([this.worldObjects.terrain.terrain]);
    }
    updateWorldObjects (time) {
        this.worldObjects.player.update(time);
    }
    render (time) {
        if (time === undefined) {
            time = 0;
        }
        this.updateWorldObjects(time);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}
new World();











