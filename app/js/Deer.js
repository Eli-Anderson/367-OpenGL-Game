import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";


export default class Deer extends Group{
    constructor(startingLane, direction) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/deerGLTF/scene.gltf', this.handleLoad.bind(this));
        this.lane = startingLane;
        this.direction = direction;
    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file of the player we are using
     */
    handleLoad(gltf) {
        this.deer = gltf.scene.children[0];
        this.deer.material = new THREE.MeshLambertMaterial();
        this.deer.material.castShadow = true;
        this.deer.material.receiveShadow = false;

        //move to left to see it initially
        this.deer.position.x = this.lane;
        // this.deer.rotateZ(Math.PI/2);

        if (this.direction === "left") {
            this.deer.rotateZ(-Math.PI / 6);
        }

        if (this.direction === "right") {
            this.deer.rotateZ(5* Math.PI / 6);
        }

        let scaleFactor = 25;
        this.deer.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.add(this.deer);
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        if (this.direction === "left") {
            this.deer.position.x -= 2;
        }
        if (this.direction === "right") {
            this.deer.position.x += 2;
        }
    }

    getDeerInitialLanePosition() {
        return this.lane;
    }


    /**
     * Returns the current position of the motorcycle so the main class can access it
     * @param direction - the direction of the motorcycle the user wants to know
     */
    getDeerPosition(direction) {
        switch (direction) {
            case "x":{
                return this.deer.position.x;
            }
            case "y": {
                return this.deer.position.y;
            }
            case "z": {
                return this.deer.position.z;
            }
            default : break;
        }
    }

    /**
     * Setter for the x position of the deer
     * @param pos - the value of the position to be at
     */
    setDeerPositionX(pos) {
        this.deer.position.x = pos;
    }

    /**
     * Setter for the y position of the deer
     * @param pos - the value of the position to be at
     */
    setDeerPositionY(pos) {
        this.deer.position.y = pos;
    }

    /**
     * Setter for the z position of the deer
     * @param pos - the value of the position to be at
     */
    setDeerPositionZ(pos) {
        this.deer.position.z = pos;
    }


}