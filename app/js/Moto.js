import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";


export default class Moto extends Group{
    constructor(lane) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/motoGLTF/scene.gltf', this.handleLoad.bind(this));
        this.lane = lane;
    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file of the player we are using
     */
    handleLoad(gltf) {
        this.moto = gltf.scene.children[0];
        this.moto.material = new THREE.MeshLambertMaterial();
        this.moto.material.castShadow = true;
        this.moto.material.receiveShadow = false;

        //move to left to see it initially
        this.moto.position.x = this.lane;
        let scaleFactor = 1;
        this.moto.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.add(this.moto);
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.moto.position.z -= 2;
    }


    /**
     * Returns the current position of the motorcycle so the main class can access it
     * @param direction - the direction of the motorcycle the user wants to know
     */
    getMotoPosition(direction) {
        switch (direction) {
            case "x":{
                return this.moto.position.x;
            }
            case "y": {
                return this.moto.position.y;
            }
            case "z": {
                return this.moto.position.z;
            }
            default : break;
        }
    }

    /**
     * Setter for the x position of the motorcycle
     * @param pos - the value of the position to be at
     */
    setMotoPositionX(pos) {
        this.moto.position.x = pos;
    }

    /**
     * Setter for the y position of the motorcycle
     * @param pos - the value of the position to be at
     */
    setMotoPositionY(pos) {
        this.moto.position.y = pos;
    }

    /**
     * Setter for the z position of the motorcycle
     * @param pos - the value of the position to be at
     */
    setMotoPositionZ(pos) {
        this.moto.position.z = pos;
    }


}