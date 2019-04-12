import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";


export default class Box extends Group{
    constructor(lanePosition) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/boxGLTF/scene.gltf', this.handleLoad.bind(this));
        this.lanePosition = lanePosition;
    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file of the player we are using
     */
    handleLoad(gltf) {
        this.box = gltf.scene.children[0];
        this.box.material = new THREE.MeshLambertMaterial();
        this.box.material.castShadow = true;
        this.box.material.receiveShadow = false;
        this.box.position.z = -300;
        //move to left to see it initially
        this.box.position.x = this.lanePosition;
        let scaleFactor = .75;
        this.box.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.add(this.box);
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.box.rotateZ(.01);
    }


    /**
     * Returns the current position of the box so the main class can access it
     * @param direction - the direction of the box the user wants to know
     */
    getBoxPosition(direction) {
        switch (direction) {
            case "x":{
                return this.box.position.x;
            }
            case "y": {
                return this.box.position.y;
            }
            case "z": {
                return this.box.position.z;
            }
            default : break;
        }
    }

    /**
     * Setter for the x position of the box
     * @param pos - the value of the position to be at
     */
    setBoxPositionX(pos) {
        this.box.position.x = pos;
    }

    /**
     * Setter for the y position of the box
     * @param pos - the value of the position to be at
     */
    setBoxPositionY(pos) {
        this.box.position.y = pos;
    }

    /**
     * Setter for the z position of the box
     * @param pos - the value of the position to be at
     */
    setBoxPositionZ(pos) {
        this.box.position.z = pos;
    }


}