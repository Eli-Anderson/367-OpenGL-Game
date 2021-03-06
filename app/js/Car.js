import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";

export default class Car extends Group {
    constructor() {
        super();
        
        // Load a glTF resource
        // Instantiate a loader
        this.loaded = false;
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/old_rusty_car/scene.gltf', this.handleLoad.bind(this));
        
        this.createLanes();
        this.speed = 600;
        this.lane = 1;
        this.laneChangeSpeed = 25;
        this.changingLanes = false;
        this.boundingBoxScalar = new THREE.Vector3(-170, 0, -150);
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
        this.car.rotateZ(Math.PI);
        this.car.animations;
        let scaleFactor = 0.4;
        this.car.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.boundingBox = new THREE.Box3().setFromObject(this.car);

        this.add(this.car);
        this.loaded = true;
        //this.add(new THREE.Box3Helper(this.boundingBox, 0xFFFFFF)) // shows the bounding box
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.boundingBox.setFromObject(this.car);
        // shrink the bounding box to fit the car
        this.boundingBox.expandByVector(this.boundingBoxScalar);

        // move the player to its desired position
        let lanePosition = this.lanes[this.lane];
        lanePosition.z = this.car.position.z;
        this.car.position.lerp(lanePosition, dt * this.laneChangeSpeed);

        // move it "forward" based on some speed
        this.car.position.z -= this.speed * dt;


        // if the player is close to the lane center, then let them change lanes again
        if (this.car.position.distanceTo(lanePosition) <= 20) {
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