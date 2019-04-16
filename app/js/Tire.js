import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";


export default class Tire extends Group {
    constructor(size, directionToFace) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loaded = false;
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/tireGLTF/scene.gltf', this.handleLoad.bind(this));

        // Tires initial position is the grill is facing to the right
        this.size = size;
        this.directionToFace = directionToFace;

    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file of the player we are using
     */
    handleLoad(gltf) {
        this.tire = gltf.scene.children[0];
        this.tire.material = new THREE.MeshLambertMaterial();
        this.tire.material.castShadow = true;
        this.tire.material.receiveShadow = false;
        this.tire.position.z = -100;
        // this.tire.position.y = 75;
        // this.tire.position.x = -200;

        if (this.directionToFace === "left")
            this.tire.rotateZ(Math.PI);

        let scaleFactor = this.size;
        this.tire.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.add(this.tire);
        this.loaded = true;
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.tire.rotateX(-.1);
    }


    /**
     * Returns the current position of the box so the main class can access it
     * @param direction - the direction of the box the user wants to know
     */
    getTirePosition(direction) {
        switch (direction) {
            case "x": {
                return this.tire.position.x;
            }
            case "y": {
                return this.tire.position.y;
            }
            case "z": {
                return this.tire.position.z;
            }
            default :
                break;
        }
    }

    /**
     * Setter for the x position of the box
     * @param pos - the value of the position to be at
     */
    setTirePositionX(pos) {
        this.tire.position.x = pos;
    }

    /**
     * Setter for the y position of the box
     * @param pos - the value of the position to be at
     */
    setTirePositionY(pos) {
        this.tire.position.y = pos;
    }

    /**
     * Setter for the z position of the box
     * @param pos - the value of the position to be at
     */
    setTirePositionZ(pos) {
        this.tire.position.z = pos;
    }


}