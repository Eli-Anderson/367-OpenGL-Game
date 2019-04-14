import * as THREE from 'three';
import Lanes from './lanes';
export default class RoadGenerator {
    constructor({scene, player, length=1000, width=400}) {
        this.scene = scene;
        this.player = player;
        this.roadPrefab = this.initializeRoadPrefab(width, length);
        this.roads = [];
        this.roadIndex = 0;
        for (let i=0; i < 3; i++) {
            this.spawnRoad();
        }

    }

    spawnRoad() {
        let width = 400;
        let length = 1000;
        let road = this.roadPrefab.clone();
        let position = new THREE.Vector3();
        let rotation = 0;
        let direction = new THREE.Vector3(0,0,-1);
        if (this.roads.length !== 0) {
            let last = this.roads[this.roadIndex-1];
            rotation = last.rotation;
            position.copy(last.mesh.position);
            let choice = Math.random();
            if (choice < 0.2) {
                // straight
                position.add(last.direction.clone().multiplyScalar(length));
                direction = last.direction;
            } else {
                if (Math.random() < 0.5) {
                    // left
                    rotation += - Math.PI / 2;
                    direction = last.direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI / 2);
                    
                } else {
                    // right
                    rotation += Math.PI / 2;
                    direction = last.direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 2)
                }
                let l = last.direction.clone().multiplyScalar(((length / 2) + (width / 2)));
                let w = direction.clone().multiplyScalar(((length / 2) - (width / 2)));
                let offset = l.add(w);
                position.add(offset);
            }
        }
        road.rotateZ(rotation);

        road.position.set(position.x, position.y, position.z);
        this.scene.add(road);
        this.roads[this.roadIndex] = {'mesh':road, 'direction':direction, 'rotation':rotation};
        this.roadIndex++;
    }

    initializeRoadPrefab(width, length) {
        let imageCanvas = document.createElement( "canvas" );
		let context = imageCanvas.getContext( "2d" );

		imageCanvas.width = imageCanvas.height = 128;

		context.fillStyle = "#444";
		context.fillRect( 0, 0, 128, 128 );

		context.fillStyle = "#fff";
		context.fillRect( 0, 0, 64, 64 );
		context.fillRect( 64, 64, 64, 64 );

		let textureCanvas = new THREE.CanvasTexture( imageCanvas );
		textureCanvas.repeat.set( 2, 6 );
		textureCanvas.wrapS = THREE.RepeatWrapping;
		textureCanvas.wrapT = THREE.RepeatWrapping;

		
		let	materialCanvas = new THREE.MeshPhongMaterial( { map: textureCanvas } );
		let geometry = new THREE.PlaneBufferGeometry( 1, 1 );
		let meshCanvas = new THREE.Mesh( geometry, materialCanvas );
		meshCanvas.receiveShadow = true;
		meshCanvas.rotation.x = - Math.PI / 2;
		meshCanvas.scale.set(width, length, 1);
		return meshCanvas;
    }

    update(dt) {
        for (let road of this.roads.filter(a=>a!==null)) {
            //if (road.)
        }
        if (this.roads.length > 0 && this.roadIndex >= 3) {
            if (this.player.mesh.position.distanceToSquared(this.roads[this.roadIndex-3].mesh.position) < 50000) {
                this.spawnRoad();
                if (this.roadIndex >= 5) {
                    this.scene.remove(this.roads[this.roadIndex-4]);
                    this.roads[this.roadIndex-4] = null;
                }
            }
        }
        
    }
}