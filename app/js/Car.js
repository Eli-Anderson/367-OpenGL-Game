import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";

export default class Car extends Group {
    constructor() {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/carGLTF/scene.gltf', this.handleLoad.bind(this));

        this.createLanes();

    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file of the player we are using
     */
    handleLoad(gltf) {
        this.car = gltf.scene.children[0];
        this.car.material = new THREE.MeshLambertMaterial();
        this.car.material.castShadow = true;
        this.car.material.receiveShadow = false;
        this.car.position.z = -10;
        this.car.rotateZ(-Math.PI/2);
        this.car.animations;
        let scaleFactor = 50;
        this.car.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.add(this.car);
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.car.material.castShadow = true;
        this.car.material.receiveShadow = false;

        // move the player to its desired position
        let lanePosition = this.lanes[this.lane];
        lanePosition.z = this.car.position.z;
        this.car.position.lerp(lanePosition, dt * this.laneChangeSpeed);

        // move it "forward" based on some speed
        this.car.position.z -= this.speed;


        // if the player is close to the lane center, then let them change lanes again
        if (this.car.position.distanceTo(lanePosition) <= 10) {
            this.changingLanes = false;
        }
    }

    /**
     * Returns the current position of the motorcycle so the main class can access it
     * @param direction - the direction of the motorcycle the user wants to know
     */
    getCarPosition(direction) {
        switch (direction) {
            case "x": {
                return this.car.position.x;
            }
            case "y": {
                return this.car.position.y;
            }
            case "z": {
                return this.car.position.z;
            }
            default :
                break;
        }
    }

    /**
     * Creates the lanes and the necessary components of lane changing
     */
    createLanes() {
        this.carPosition = new THREE.Vector3(0, 40, -100);
        this.lanes = [
            new THREE.Vector3(-160, this.carPosition.y, this.carPosition.z),
            new THREE.Vector3(0, this.carPosition.y, this.carPosition.z),
            new THREE.Vector3(160, this.carPosition.y, this.carPosition.z),
        ];
        this.lane = 1;
        this.laneChangeSpeed = 50;
        this.speed = 4;
        this.changingLanes = false;
    }

    /**
     * Set the speed of the car
     * @param speed - how fast the car goes down the road
     */
    setCarSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Returns the current speed of the car
     * @returns speed - how fast the car is going
     */
    getCarSpeed() {
        return this.speed;
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


}