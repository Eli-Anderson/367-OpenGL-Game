import * as THREE from 'three';
import Car from './Car';
import Box from './Box';
import Deer from './Deer';
import Moto from './Moto';
import Tire from './Tire';

// Variables to use throughout main
let timeBefore = Date.now();
let pointsLabel = document.getElementById("score");

export default class App {
    constructor(){
        this.countTime = 0;
        // Creates all of canvas and scenery necessary
        this.createCanvas();
        this.score = 0;
        this.paused = false;

        document.getElementById("close-button").onclick = ()=>{this.reset()};

        // Create the different lanes
        this.leftLaneValue = -160;
        this.centerLaneValue = 0;
        this.rightLaneValue = 160;

        // Distance to spawn away from the car
        this.spawnDistance = 1500;

        // Time to wait to spawn objects in
        this.waitToSpawn = 350;

        // How long to wait until objects disappear
        this.waitToDisappear = 5;


        // Creates the main players car
        this.car = new Car();

        // Creates the box obstacle
        this.boxes = [];
        for (let i = 0; i < 9; i++) {
            if (i < 3)
                this.boxes[i] = new Box(this.leftLaneValue);
            if (i >= 3 && i < 6)
                this.boxes[i] = new Box(this.centerLaneValue);
            if (i >= 6)
                this.boxes[i] = new Box(this.rightLaneValue);
        }

        // Add the deer to hit
        this.deer = [];
        for (let i = 0; i < 4; i++) {
            if (i < 2)
                this.deer[i] = new Deer(this.rightLaneValue, "left");
            else
                this.deer[i]= new Deer(this.leftLaneValue, "right");
        }

        // Add the motorcycles
        this.bikes = [];
        for (let i = 0; i < 6; i++) {
            if (i < 2)
                this.bikes[i] = new Moto(this.leftLaneValue);
            if (i >=2 && i < 4)
                this.bikes[i] = new Moto(this.centerLaneValue);
            if (i >=4)
                this.bikes[i] = new Moto(this.rightLaneValue);
        }

        // Add a tire
        let bigTireSize = 50;
        this.bigTirePositionX = 80;
        this.bigTirePositionZ = 225;

        let smallTireSize = 45;
        this.smallTirePositionX = 70;
        this.smallTirePositionZ = -45;

        this.tireBackRight = new Tire(bigTireSize, "right");
        this.tireBackLeft = new Tire(bigTireSize, "left");
        this.tireFrontRight = new Tire(smallTireSize, "right");
        this.tireFrontLeft = new Tire(smallTireSize, "left");

        this.allLoadables = [].concat(this.bikes).concat(this.boxes).concat(this.deer).concat([this.car, this.tireBackRight, this.tireBackLeft, this.tireFrontLeft, this.tireFrontRight])

		this.boxIndex = 0;

        //Add the objects
        this.addObjectsToScene();

        window.addEventListener('resize', () => this.resizeHandler());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.resizeHandler();
        
        // Check every 1000ms to see if all our objects are loaded
		let loadInterval = setInterval(()=>{
            for (let loadable of this.allLoadables) {
                if (loadable.loaded === false) return;
            }
            // if we get to this point, all objects are loaded, so let's start the render function
            clearInterval(loadInterval);
            this.spawnObjects();
			requestAnimationFrame(() => this.render());
        }, 1000)
        
    }

    /**
     * Render function that is called every frame to update the objects
     */
    render() {
        let dt = (Date.now() - timeBefore) / 1000; // dt in seconds
        timeBefore = Date.now();
        if (!this.paused) {
            this.countTime++;

            // Update the text at the top
            this.score = Math.floor(this.countTime / 60);
            pointsLabel.innerText = "Points: " + this.score;
            
            // Spawns all of the objects initially so they don't have to load later
            //if (this.countTime === this.waitToSpawn)
            //    this.spawnObjects();

            // After all of the objects have been made, make them disappear
            //if (this.countTime === this.waitToSpawn + this.waitToDisappear)
            //    this.changeObstacleVisiblity(false);

            // Show the car and get it moving
            //this.car.visible = true;
            this.car.update(dt);

            // Increase the car's speed every x distance
            if (this.countTime % 2500 === 0) {
                this.car.setCarSpeed(this.car.getCarSpeed() + 2);
            }

            // Get all of the boxes rotating
            for (let i = 0; i < this.boxes.length; i++) {
                this.boxes[i].update(dt);
            }

            // Have the light follow the car
            this.camera.position.z = this.car.car.position.z + 400;
            this.light.position.z = this.car.car.position.z - 100;
            this.light.target.position.z = this.car.car.position.z + 10;

            // Add the tires for the car
            this.rotateTires(dt);

            // // Add all of the obstacles at certain intervals of time
            this.placeObstacles(dt);


            for (let box of this.boxes) {
                if (this.car.boundingBox.intersectsBox(box.boundingBox)) {
                    box.visible = true;
                    this.gameOver();
                    break;
                }
            }



            this.renderer.render(this.scene, this.camera);
        }
        // setup the render function to "autoloop"
        requestAnimationFrame(() => this.render());
    }

    /**
     * Places all of the obstacles at certain intervals
     */
    placeObstacles(dt) {
        // Place the boxes every x amount of frames
        if (this.countTime % 200 === 0) {
			this.placeBoxRandomly(this.boxIndex);
			this.boxIndex = (this.boxIndex + 1) % 9;
        }

        // don't load in the deer until certain distances
        if (this.countTime % 200 === 0) {
            //this.placeDeerRandomly(Math.floor(Math.random() * 4));
        }
        for (let i = 0; i < this.deer.length; i++) {
            this.deer[i].update(dt);
        }

        // Don't load in the bike until certain intervals
        if (this.countTime % 400 === 0) {
            //this.placeBikeRandomly(Math.floor(Math.random() * 6))
        }
        for (let j = 0; j < this.bikes.length; j++) {
            this.bikes[j].update(dt);
        }
    }

    /**
     * Handles the randomness of the different boxes
     * @param index - the box in the array to choose
     */
    placeBoxRandomly(index) {
        this.boxes[index].visible = true;
        this.boxes[index].box.position.z = this.car.car.position.z - (this.spawnDistance + Math.random()*500);
    }

    /**
     * Places the deer randomly on the left or the right lane
     * @param index - the specific deer in the array to choose
     */
    placeDeerRandomly(index) {
        this.deer[index].visible = true;
        this.deer[index].setDeerPositionZ(this.car.getCarPosition("z") - this.spawnDistance + 700);
        this.deer[index].setDeerPositionX(this.deer[index].getDeerInitialLanePosition());
    }

    /**
     * Places the motorcycles randomly in each lane
     * @param index
     */
    placeBikeRandomly(index) {
        this.bikes[index].visible = true;
        this.bikes[index].setMotoPositionZ(this.car.getCarPosition("z") - this.spawnDistance);
    }

    /**
     * Adds objects to the scene and makes them initially invisible
     */
    addObjectsToScene() {

        // add the car
        this.car.visible = false;
        this.scene.add(this.car);

        // add the motorcycle
        for (let j = 0; j < this.bikes.length; j++) {
            this.bikes[j].visible = false;
            this.scene.add(this.bikes[j]);
        }

        // add the deer
        for (let k = 0; k < this.deer.length; k++) {
            this.deer[k].visible = false;
            this.scene.add(this.deer[k]);
        }

        // add all of the boxes
        for (let i = 0; i < this.boxes.length; i++) {
            //this.boxes[i].visible = false;
            this.scene.add(this.boxes[i]);
        }

        // add the tires
        this.tireBackRight.visible = false;
        this.scene.add(this.tireBackRight);

        this.tireBackLeft.visible = false;
        this.scene.add(this.tireBackLeft);

        this.tireFrontLeft.visible = false;
        this.scene.add(this.tireFrontLeft);

        this.tireFrontRight.visible = false;
        this.scene.add(this.tireFrontRight);
    }

    /**
     * Spawns all of the obstacles, but behind the camera.
     * This is done so that all of the loading happens in the beginning
     */
    spawnObjects() {

        let howFarBehindToSpawn = -1000;
        // add the motorcycle
        for (let j = 0; j < this.bikes.length; j++) {
            this.bikes[j].visible = true;
            this.bikes[j].setMotoPositionZ(howFarBehindToSpawn);
        }

        // add the deer
        for (let k = 0; k < this.deer.length; k++) {
            this.deer[k].visible = true;
            this.deer[k].setDeerPositionZ(howFarBehindToSpawn);
        }

        // add all of the boxes
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].visible = true;
            this.boxes[i].box.position.z = howFarBehindToSpawn;
        }
    }

    /**
     * Changes all of the obstacles visibility to the defined visibility
     * @param visibility - whether an object can be seen or not
     */
    changeObstacleVisiblity(visibility) {

        // add the motorcycle
        for (let j = 0; j < this.bikes.length; j++) {
            this.bikes[j].visible = visibility;
        }

        // add the deer
        for (let k = 0; k < this.deer.length; k++) {
            this.deer[k].visible = visibility;
        }

        // add all of the boxes
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].visible = visibility;
        }
    }

    /**
     * Rotates the tires and keeps them up to date with the car
     */
    rotateTires(dt) {
        this.tireBackLeft.position.x = this.car.car.position.x - this.bigTirePositionX;
        this.tireBackLeft.position.y = this.car.car.position.y;
        this.tireBackLeft.position.z = this.car.car.position.z + this.bigTirePositionZ;
        this.tireBackLeft.visible = true;
        this.tireBackLeft.update(dt);

        this.tireBackRight.position.x = this.car.car.position.x + this.bigTirePositionX;
        this.tireBackRight.position.y = this.car.car.position.y;
        this.tireBackRight.position.z = this.car.car.position.z + this.bigTirePositionZ;
        this.tireBackRight.visible = true;
        this.tireBackRight.update(dt);

        this.tireFrontLeft.position.x = this.car.car.position.x - this.smallTirePositionX;
        this.tireFrontLeft.position.y = this.car.car.position.y;
        this.tireFrontLeft.position.z = this.car.car.position.z + this.smallTirePositionZ;
        this.tireFrontLeft.visible = true;
        this.tireFrontLeft.update(dt);

        this.tireFrontRight.position.x = this.car.car.position.x + this.smallTirePositionX;
        this.tireFrontRight.position.y = this.car.car.position.y;
        this.tireFrontRight.position.z = this.car.car.position.z + this.smallTirePositionZ;
        this.tireFrontRight.visible = true;
        this.tireFrontRight.update(dt);
    }

    createCanvas() {
        const canvas = document.getElementById('mycanvas');
        // Enable antialias for smoother lines
        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 750, 1800);

        this.camera = new THREE.PerspectiveCamera(75, 4 / 3, 0.5, 5000);

        this.camera.position.y = 400;
        this.camera.position.z = 200;
        this.camera.rotateX(-Math.PI / 6);

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
        this.scene.add(new THREE.AmbientLight(0xF0F0F0)); // soft white light
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
        if (this.paused === false) {
            switch (e.key) {
                case "d": {
                    this.car.changeLane(1); // right
                }
                    break;
                case "a": {
                    this.car.changeLane(-1); // left
                }
                    break;
            }
        }
    }

    gameOver() {
        this.paused = true;
        document.getElementById("game-over-score").innerText = this.score;
        document.getElementById("game-over").style.display = "block";
    }

    reset() {
        document.getElementById("game-over").style.display = "none";
        this.paused = false;
        this.countTime = 0;

        this.car.car.position.set(0,0,0);
        this.car.changeLane(1);

        for (let box of this.boxes) {
            box.box.position.set(0,0,500)
        }
    }
}