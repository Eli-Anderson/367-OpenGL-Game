import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import {Group} from "three";


export default class Box extends Group{
    constructor(lanePosition) {
        super();

        // Load a glTF resource
        // Instantiate a loader
        this.loaded = false;
        this.loader = new GLTFLoader();
        this.loader.load('./app/js/3DObjects/boxGLTF/scene.gltf', (gltf)=>{this.handleLoad(gltf)});
        this.lanePosition = lanePosition;
    }

    /**
     * Handles loading the 3D object of the player.
     * Also sets all of the initial values for the motorcycle
     * @param gltf - the .gltf file for the model
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

        this.boundingBox = new THREE.Box3().setFromObject(this.box);
        //this.add(new THREE.Box3Helper(this.boundingBox, 0xFFFFFF)) // shows the bounding box

        this.add(this.box);
        this.loaded = true;
    }

    /**
     * Called every frame and updates the object's state.
     */
    update(dt) {
        this.box.rotateZ(0.5*dt);
        this.boundingBox.setFromObject(this.box);
        // shrink the bounding box slightly so it is easier to avoid
        this.boundingBox.expandByScalar(-10);
    }
}