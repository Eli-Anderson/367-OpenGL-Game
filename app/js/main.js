import * as THREE from 'three';
// import orbit from 'three-orbit-controls';
// const OrbitControls = orbit(THREE);
import TrackballControls from 'three-trackballcontrols';
import Player from './player';
import Spawner from './spawner';
import RoadGenerator from './roadGenerator';

let timeBefore = Date.now();

class TestObject {
	constructor({position=[0,0,0], rotation}) {
		let geometry = new THREE.BoxGeometry(20, 20, 20);
		let material = new THREE.MeshPhongMaterial({color: 0xF7E82ED});
		this.mesh = new THREE.Mesh(geometry, material);
		
		this.mesh.geometry.computeBoundingBox();
		this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		this.mesh.position.set(position[0], position[1], position[2]);
		this.boundingBox.setFromObject(this.mesh);
		this.mesh.castShadow = true;
	}

	onCollisionWithPlayer(player) {
		let vec3 = new THREE.Vector3();
		player.boundingBox.getSize(vec3);
		this.mesh.translateY(vec3.y+0.1);
	}
}

export default class App {
	constructor() {
		const canvas = document.getElementById('mycanvas');
		// Enable antialias for smoother lines
		this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.scene = new THREE.Scene();
		//this.scene.fog = new THREE.Fog( 0x000000, 750, 2000 );

		this.camera = new THREE.PerspectiveCamera(75, 4/3, 0.5, 5000);

		this.camera.position.y = 200;
		this.camera.position.z = 120;
		this.camera.rotateX(-Math.PI/6);

		this.player = new Player({});
		this.scene.add(this.player.mesh);

		this.light = this.createLight();
		this.scene.add(this.light);
		this.scene.add(this.light.target);

		// ground
		let imageCanvas = document.createElement( "canvas" );
		let context = imageCanvas.getContext( "2d" );

		imageCanvas.width = imageCanvas.height = 128;

		context.fillStyle = "#444";
		context.fillRect( 0, 0, 128, 128 );

		context.fillStyle = "#fff";
		context.fillRect( 0, 0, 64, 64 );
		context.fillRect( 64, 64, 64, 64 );

		let textureCanvas = new THREE.CanvasTexture( imageCanvas );
		textureCanvas.repeat.set( 1000, 1000 );
		textureCanvas.wrapS = THREE.RepeatWrapping;
		textureCanvas.wrapT = THREE.RepeatWrapping;

		
		let	materialCanvas = new THREE.MeshPhongMaterial( { map: textureCanvas } );
		let geometry = new THREE.PlaneBufferGeometry( 100, 100 );
		let meshCanvas = new THREE.Mesh( geometry, materialCanvas );
		meshCanvas.receiveShadow = true;
		meshCanvas.rotation.x = - Math.PI / 2;
		meshCanvas.scale.set(1000, 1000, 1);
		//this.scene.add(meshCanvas);

		// ambient light
		this.scene.add(new THREE.AmbientLight( 0x404040 )); // soft white light

		//let helper = new THREE.CameraHelper( this.light.shadow.camera );
		//this.scene.add( helper );

		this.spawner = new Spawner({player:this.player, scene:this.scene, objectTypes:[TestObject], intervalFunction:()=>{return 1.0}});
		this.spawner.start();

		//this.controls = new TrackballControls(this.camera);

		this.roadGenerator = new RoadGenerator({'player':this.player, 'scene':this.scene});

		window.addEventListener('resize', () => this.resizeHandler());
		document.addEventListener('keydown', (e) => this.handleInput(e));
		this.resizeHandler();
		requestAnimationFrame(() => this.render());
	}

	createLight() {
		let light = new THREE.DirectionalLight (0xFFFFFF, 1.0);
		light.position.set (150, 100, 0);
		light.shadow.camera = new THREE.OrthographicCamera( -200, 600, 200, -100, 0.5, 1000 );
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		light.castShadow = true;
		return light;
	}

	render() {
		let dt = (Date.now() - timeBefore) / 1000; // dt in seconds
		timeBefore = Date.now();

		this.player.update(dt);
		this.spawner.update(dt);

		this.player.boundingBox.setFromObject(this.player.mesh);
		for (let o of this.spawner.objects) {
			o.boundingBox.setFromObject(o.mesh);
			if (this.player.boundingBox.intersectsBox(o.boundingBox)) {
				this.player.onCollisionWithObject(o);
				o.onCollisionWithPlayer(this.player);
			}

		}
		this.camera.position.z = this.player.mesh.position.z + 200;
		this.light.position.z = this.player.mesh.position.z - 100;
		this.light.target.position.z = this.light.position.z + 10;

		this.roadGenerator.update(dt);

		this.renderer.render(this.scene, this.camera);
		//this.controls.update();
		// setup the render function to "autoloop"
		requestAnimationFrame(() => this.render());
	}

	resizeHandler() {
		const canvas = document.getElementById("mycanvas");
		let w = window.innerWidth - 16;
		let h = 0.75 * w;  /* maintain 4:3 ratio */
		if (canvas.offsetTop + h > window.innerHeight) {
			h = window.innerHeight - canvas.offsetTop - 16;
			w = 4/3 * h;
		}
		canvas.width = w;
		canvas.height = h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
		//this.tracker.handleResize();
	}

	handleInput(e) {
		switch (e.key) {
			case "d":
			{
				this.player.changeLane(1); // right
			} break;
			case "a":
			{
				this.player.changeLane(-1); // left
			} break;
		}
	}
}