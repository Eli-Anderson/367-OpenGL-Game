import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import carGLTF from './scene.gltf';

import Player from './player';
import Spawner from './spawner';

// Variables to use throughout main
let car;
let countTime = 1;
let dt;
let position;
let timeBefore = Date.now();

class TestObject {
    constructor({position = [0, 0, 0], rotation}) {
        let geometry = new THREE.BoxGeometry(20, 20, 20);
        let material = new THREE.MeshPhongMaterial({color: 0xF7E82ED});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position[0], position[1], position[2]);


    }
}

export default class App {
    constructor() {

        // Creates all of canvas and scenery necessary
        this.createCanvas();

        this.spawner = new Spawner({
            player: this.player,
            scene: this.scene,
            objects: [TestObject],
            intervalFunction: () => {
                return 1.0
            }
        });
        this.spawner.start();

        // Load a glTF resource
        // Instantiate a loader
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/scene.gltf', this.carHandleLoad.bind(this));

        // Creates the lanes for the objects to go in
        this.createLanes();


        window.addEventListener('resize', () => this.resizeHandler());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.resizeHandler();
        requestAnimationFrame(() => this.render());
    }

    /**
     * Render function that is called every frame to update the objects
     */
    render() {
        dt = (Date.now() - timeBefore) / 1000; // dt in seconds
        timeBefore = Date.now();
        this.player.update(dt);
        this.spawner.update(dt);

        console.log(countTime);
        countTime++;
        if (countTime > 50) {
            this.changeCar();
            this.camera.position.z = car.position.z + 200;
            this.light.position.z = car.position.z - 100;
            this.light.target.position.z = car.position.z + 10;
        }


        this.renderer.render(this.scene, this.camera);
        //this.controls.update();
        // setup the render function to "autoloop"
        requestAnimationFrame(() => this.render());
    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the car
     * @param gltf - the .gltf file of the player we are using
     */
    carHandleLoad(gltf) {
        car = gltf.scene.children[0];
        car.material = new THREE.MeshLambertMaterial();
        car.material.castShadow = true;
        car.material.receiveShadow = false;
        car.position.z = -10;
        car.rotateZ(-Math.PI / 2);
        car.scale.set(20, 20, 20);
        this.scene.add(car);
    }

    /**
     * Called every frame and updates the player's state.
     */
    changeCar() {
        car.material.castShadow = true;
        car.material.receiveShadow = false;

        // move the player to its desired position
        let lanePosition = this.lanes[this.lane];
        lanePosition.z = car.position.z;
        car.position.lerp(lanePosition, dt * 10);

        // move it "forward" based on some speed
        car.position.z -= this.speed;

        // if the player is close to the lane center, then let them change lanes again
        if (car.position.distanceTo(lanePosition) <= 10) {
            this.changingLanes = false;
        }
    }

    createLanes() {
        position = new THREE.Vector3(0, 40, -100);
        this.lanes = [
            new THREE.Vector3(-160, position.y, position.z),
            new THREE.Vector3(0, position.y, position.z),
            new THREE.Vector3(160, position.y, position.z),
        ];
        this.lane = 1;
        this.laneChangeSpeed = 5;
        this.speed = 2;
        this.changingLanes = false;
    }

    /**
     * Attempts to set the player's lane to an adjacent one. This does not update
     * the player's position, but simply sets a new target for the player to
     * move to. The player's lane can only be changed if they are not already changing
     * lanes. This is called from main.js handleInput().
     *
     * @param {number} direction The direction of the lane change. This should be either
     * -1 or 1, where -1 moves "left" and 1 moves "right" (negative/positive on the X axis)
     */
    changeLane(direction = 1) {
        const RIGHT = 1, LEFT = -1;
        if (this.changingLanes === false) {
            if (direction === RIGHT && this.lane < 2) {
                this.changingLanes = true;
                this.lane++;
            }
            if (direction === LEFT && this.lane > 0) {
                this.changingLanes = true;
                this.lane--;
            }
        }
    }

    createCanvas() {
        const canvas = document.getElementById('mycanvas');
        // Enable antialias for smoother lines
        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 750, 1200);

        this.camera = new THREE.PerspectiveCamera(75, 4 / 3, 0.5, 5000);

        this.camera.position.y = 200;
        this.camera.position.z = 120;
        this.camera.rotateX(-Math.PI / 6);

        this.player = new Player({});
        // this.scene.add(this.player.mesh);


        this.light = this.createLight();
        this.scene.add(this.light);
        this.scene.add(this.light.target);

        // ground
        let imageCanvas = document.createElement("canvas");
        let context = imageCanvas.getContext("2d");

        imageCanvas.width = imageCanvas.height = 128;

        context.fillStyle = "#444";
        context.fillRect(0, 0, 128, 128);

        context.fillStyle = "#fff";
        context.fillRect(0, 0, 64, 64);
        context.fillRect(64, 64, 64, 64);

        let textureCanvas = new THREE.CanvasTexture(imageCanvas);
        textureCanvas.repeat.set(1000, 1000);
        textureCanvas.wrapS = THREE.RepeatWrapping;
        textureCanvas.wrapT = THREE.RepeatWrapping;


        let materialCanvas = new THREE.MeshPhongMaterial({map: textureCanvas});
        let geometry = new THREE.PlaneBufferGeometry(100, 100);
        let meshCanvas = new THREE.Mesh(geometry, materialCanvas);
        meshCanvas.receiveShadow = true;
        meshCanvas.rotation.x = -Math.PI / 2;
        meshCanvas.scale.set(1000, 1000, 1000);
        this.scene.add(meshCanvas);

        // ambient light
        this.scene.add(new THREE.AmbientLight(0x404040)); // soft white light

        let helper = new THREE.CameraHelper(this.light.shadow.camera);
        this.scene.add(helper);
    }

    createLight() {
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(150, 100, 0);
        light.shadow.camera = new THREE.OrthographicCamera(-200, 600, 200, -100, 0.5, 1000);
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.castShadow = true;
        return light;
    }

    resizeHandler() {
        const canvas = document.getElementById("mycanvas");
        let w = window.innerWidth - 16;
        let h = 0.75 * w;  /* maintain 4:3 ratio */
        if (canvas.offsetTop + h > window.innerHeight) {
            h = window.innerHeight - canvas.offsetTop - 16;
            w = 4 / 3 * h;
        }
        canvas.width = w;
        canvas.height = h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        //this.tracker.handleResize();
    }

    handleInput(e) {
        switch (e.key) {
            case "d": {
                this.changeLane(1); // right
            }
                break;
            case "a": {
                this.changeLane(-1); // left
            }
                break;
        }
    }
}