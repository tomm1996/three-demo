import BaseClass from "./BaseClass.js";
import "./helpers/ExtendMaterial.js";

export default class Terrain extends BaseClass {
    constructor(options) {
        super();

        this.pos = options.position;
        this.scale = options.scale;
        this.addPlane();
        this.generateTerrain();
        this.addToScene();
    }

    addPlane() {
        const geometry = new THREE.BoxBufferGeometry(this.scale.x, this.scale.y, this.scale.z, this.scale.x, this.scale.y, this.scale.z)
        const material = this.getMaterial();
        let blockPlane = new THREE.Mesh(geometry, material);

        blockPlane.position.set(this.pos.x, this.pos.y, this.pos.z);
        blockPlane.castShadow = true;
        blockPlane.receiveShadow = true;
        this.terrain = blockPlane;
    }

    generateTerrain() {
        this.convertToHumanReadableVertices();
        this.pickRandomHills();
        this.calcHitbox();
        this.convertBack();
    }

    convertToHumanReadableVertices() {
        const vertices = this.terrain.geometry.attributes.position.array;
        this.HumanReadableVertices = [];
        let i = 0;
        let HRObj = {};
        while (i < vertices.length) {
            HRObj.x = vertices[i++];
            HRObj.y = vertices[i++];
            HRObj.z = vertices[i++];

            this.HumanReadableVertices.push(HRObj);
            HRObj = {};
        }
    }

    pickRandomHills() {
        // create a random amount of hills
        const amount = (this.HumanReadableVertices.length * Math.random()) / 10;
        const maxHeight = 30;
        const scatter = 15;
        let hills = [];
        let humanReadableIndex = 0;
        let hillsIndex = 0;

        for (let i = 0; i <= amount / 4; i++) {
            const randomVertex = Math.floor(Math.random() * this.HumanReadableVertices.length);
            if (this.HumanReadableVertices[randomVertex].y > 0) {
                hills.push(Object.assign({}, this.HumanReadableVertices[randomVertex]));
            }
        }
        for (let i = 0; i <= amount / 4; i++) {
            let xd, yd;
            xd = (Math.random() * scatter) - scatter / 2;
            yd = (Math.random() * scatter) - scatter / 2;

            if (Math.floor(xd) + Math.floor(yd) > scatter / 2) {
                const copy = Object.assign({}, hills[Math.floor(Math.random() * amount / 10)]);

                copy.x += xd;
                copy.y += yd;
                hills.push(copy);
            }
        }

        for (let i = 0; i <= amount / 7; i++) {
            const randomVertex = Math.floor(Math.random() * this.HumanReadableVertices.length) + 1;
            if (this.HumanReadableVertices[randomVertex].y > 0) {
                hills.push(Object.assign({}, this.HumanReadableVertices[randomVertex]));
            }
        }

        const splitpoint = Math.floor(hills.length / 10);


        for (let i = 0; i < splitpoint; i++) {
            hills[i].y = Math.floor(this.hackedGaussianDistribution(8) * maxHeight) + 1;
        }

        for (let i = splitpoint; i < hills.length; i++) {
            hills[i].y = Math.floor(this.hackedGaussianDistribution(8) * maxHeight / 10) + 1;
        }

        for (hillsIndex = 0; hillsIndex < hills.length; hillsIndex++) {
            let hill = hills[hillsIndex];
            let random = -((Math.random() * 0.02) + 0.08);
            let random2 = random / ((Math.random() * 8) + 2);
            let hillWidth = this.hackedGaussianDistribution(8) * 30;
            humanReadableIndex = 0;

            for (humanReadableIndex; humanReadableIndex < this.HumanReadableVertices.length; humanReadableIndex++) {
                let point = this.HumanReadableVertices[humanReadableIndex];
                if (point.y === -0.5) {
                    continue;
                }

                let pointVector = new THREE.Vector2(point.x, point.z);
                let hillVector = new THREE.Vector2(hill.x, hill.z);

                // this is apparently called logistical growth
                if (pointVector.distanceTo(hillVector) < hillWidth) {
                    point.y += (hill.y - (hill.y * (Math.E ** (random * (hillWidth - pointVector.distanceTo(hillVector) + 0.01)))));
                    point.y -= (hill.y - (hill.y * (Math.E ** ((random2) * (hillWidth - pointVector.distanceTo(hillVector) + 0.01)))));
                }
            }
        }
        for (humanReadableIndex; humanReadableIndex < this.HumanReadableVertices.length; humanReadableIndex++) {
            const radius = 12;
            let point1 = this.HumanReadableVertices[humanReadableIndex];
            let counter = 0;
            let height = 0;
            for (humanReadableIndex; humanReadableIndex < this.HumanReadableVertices.length; humanReadableIndex++) {
                let point2 = this.HumanReadableVertices[humanReadableIndex];

                if (Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y) < radius) {
                    height += point2.y;
                    counter++;
                }
            }
            point1.y = height / counter;
        }
    }

    convertBack() {
        let HRindex = 0;
        const vertices = []
        while (HRindex < this.HumanReadableVertices.length) {
            vertices.push(this.HumanReadableVertices[HRindex].x);
            vertices.push(this.HumanReadableVertices[HRindex].y);
            vertices.push(this.HumanReadableVertices[HRindex].z);
            HRindex++;

        }
        this.terrain.geometry.attributes.position.array = new Float32Array(vertices)
        this.terrain.geometry.attributes.position.needsUpdate = true;
        this.terrain.geometry.computeVertexNormals();
    }

    getMaterial(material) {
        const loader = new THREE.TextureLoader();
        material = THREE.extendMaterial(THREE.MeshPhongMaterial, {
            uniforms: {
                aoMap: {value: null},
                displacementMap: {value: null},
                normalMap: {value: null},
                bumpMap: {value: null},
                roughnessMap: {value: null},
                specularMap: {value: null},
                alphaMap: {value: null},
            },
        });
        const textures = [
            {aoMap: 'ao'},
            {displacementMap: 'disp'},
            {normalMap: 'nor'},
            {bumpMap: 'bump'},
            {roughnessMap: 'rough'},
            {specularMap: 'spec'},
            {alphaMap: 'translucent'},
        ];
        textures.forEach((texture) => {
            const mapType = Object.keys(texture)[0];
            const mapName = texture[mapType];
            const path = `./assets/textures/snow_02_${mapName}_4k.jpg`;
            const image = loader.load(path);

            material[mapType] = material.uniforms[mapType].value = image;
        });

        return material;
    }

    hackedGaussianDistribution(v) {
        let r = 0;
        for (let i = v; i > 0; i--) {
            r += Math.random();
        }
        return r / v;
    }

    shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    calcHitbox() {
        const hitboxGeometry = new THREE.BufferGeometry().setAttribute(
            'position',
            new THREE.BufferAttribute(
                new Float32Array([
                    -5.0, -5.0, 5.0,
                    5.0, -5.0, 5.0,
                    5.0, 5.0, 5.0,

                    5.0, 5.0, 5.0,
                    -5.0, 5.0, 5.0,
                    -5.0, -5.0, 5.0
                ]),
                3
            )
        );

        const hitbox = new THREE.Mesh(
            hitboxGeometry,
            new THREE.MeshBasicMaterial({color: 0x0ff0000})
        );

        hitbox.position.set({x: 0, y: 0, z: 100})

        const wireframe = new THREE.WireframeGeometry(hitboxGeometry);

        const line = new THREE.LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.transparent = true;

        this.scene.add(hitbox, line);
    }

    addToScene() {
        this.scene.add(this.terrain);
    }
}