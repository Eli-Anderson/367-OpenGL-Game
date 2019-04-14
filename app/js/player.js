import * as THREE from 'three';

export default class Player {
    constructor({}) {
        let geometry = new THREE.BoxGeometry(20,20,20);
        let material = new THREE.MeshPhongMaterial({color:0xAA2222});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
        let position = new THREE.Vector3(0, 10, -100);
        this.direction = new THREE.Vector3(0,0,-1);
        this.lanes = [
            new THREE.Vector3(-160, position.y, position.z),
            new THREE.Vector3(0, position.y, position.z),
            new THREE.Vector3(160, position.y, position.z),
        ];
        this.mesh.position.copy(position);
        this.lane = 1;
        this.laneChangeSpeed = 5;
        this.speed = 100;
        this.changingLanes = false;
            
            
        this.mesh.geometry.computeBoundingBox();
        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.boundingBox.setFromObject(this.mesh);

    }

    /**
     * Called every frame and updates the player's state.
     * 
     * @param {number} dt The amount of time that has passed since the last frame
     * was rendered/updated.
     */
    update(dt) {
        // move the player to its desired position
        let lanePosition = this.lanes[this.lane];
        lanePosition.z = this.mesh.position.z;
        this.mesh.position.lerp(lanePosition, dt * this.laneChangeSpeed);

        // move it "forward" based on some speed
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed*dt));

        // if the player is close to the lane center, then let them change lanes again
        if (this.mesh.position.distanceTo(lanePosition) <= 10) {
            this.changingLanes = false;
        }
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

    onCollisionWithObject(object) {
        // handle something here, eventually
    }
}