import * as THREE from 'three';
export default class RoadGenerator {
    constructor({scene, player, length=1000, width=700}) {
        this.scene = scene;
        console.log(player)
        this.player = player;
        this.length = length;
        this.width = width;
        this.roadPrefab = this.initializeRoadPrefab(width, length);
        this.roads = [];
        this.numRoads = 10;
        for (let i=0; i < this.numRoads; i++) {
            this.roads.push(this.roadPrefab.clone());
        }
        this.roadIndex = 0;
        this.reset();

    }

    reset() {
        this.roadIndex = 0;
        for (let i=0; i < 10; i++) {
            this.spawnRoad(this.roads[i]);
        }
    }

    spawnRoad(road) {
        let width = 400;
        let length = 1000;
        let z = this.roadIndex * length;
        road.position.y = 2;
        road.position.z = z * -1;
        
        console.log(road.position)
        this.scene.add(road);
        this.roads.push(road);
        this.roadIndex++;
    }

    initializeRoadPrefab(width, length) {

		let texture = new THREE.TextureLoader().load('./app/textures/asphalt.jpg');
		texture.repeat.set( 4, 2 );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		
		let	materialCanvas = new THREE.MeshPhongMaterial( { map: texture } );
		let geometry = new THREE.PlaneBufferGeometry( 1, 1 );
		let meshCanvas = new THREE.Mesh( geometry, materialCanvas );
		meshCanvas.receiveShadow = true;
		meshCanvas.rotation.x = - Math.PI / 2;
		meshCanvas.scale.set(width, length, 1);
		return meshCanvas;
    }

    update(dt) {
        let index = this.roadIndex % this.numRoads;
        if (this.player.position.z < this.roads[index].position.z - this.length) {
            this.spawnRoad(this.roads[index]);
        }        
    }
}