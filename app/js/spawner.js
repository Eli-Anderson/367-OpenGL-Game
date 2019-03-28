export default class Spawner {
    constructor({objects, intervalFunction, scene, player}) {
        this.objects = objects;
        this.time = 0.0;
        this.intervalFunction = intervalFunction;
        this.scene = scene;
        this.player = player;
    }

    spawnObject() {
        if (this.objects.length > 0) {
            let i = Math.floor(Math.random() * this.objects.length);
            this.scene.add(new this.objects[i]({
                position:[-100+200*Math.random(),20,this.player.mesh.position.z-500]}).mesh);
        } else {
            console.warn("Spawner's object list is empty");
        }
    }

    start() {
        this.spawning = true;
    }

    stop() {
        this.spawning = false;
    }

    update(dt) {
        if (this.spawning) {
            this.time += dt;
            if (this.time >= this.intervalFunction()) {
                this.time = 0.0;
                this.spawnObject();
            }
        }
    }
}