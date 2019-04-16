import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";

export default class Deer extends Group {
    constructor(startingLane, direction) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loaded = false;
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/deerGLTF/scene.gltf', this.handleLoad.bind(this));
        this.lane = startingLane;
        this.direction = direction;
        this.speed = 200;
        this.boundingBoxScalar = new THREE.Vector3(-40, 0, 0);
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
        this.boundingBox = new THREE.Box3();
        this.add(this.deer);
        this.loaded = true;
        //this.add(new THREE.Box3Helper(this.boundingBox, 0xFFFFFF)) // shows the bounding box
    }

    /**
     * Called every frame and updates the player's state.
     */
    update(dt) {
        this.boundingBox.setFromObject(this.deer);
        // shrink the bounding box to fit the deer model
        this.boundingBox.expandByVector(this.boundingBoxScalar);
        if (this.direction === "left") {
            this.deer.position.x -= this.speed * dt;
        }
        if (this.direction === "right") {
            this.deer.position.x += this.speed * dt;
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