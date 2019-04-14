export default class Spawner {
    constructor({objectTypes, intervalFunction, scene, player}) {
        this.objectTypes = objectTypes;
        this.objects = [];
        this.time = 0.0;
        this.intervalFunction = intervalFunction;
        this.scene = scene;
        this.player = player;

        this.points = [];
    }

    spawnObject() {
        if (this.objectTypes.length > 0) {
            let randomIndex = Math.floor(Math.random() * this.objectTypes.length);
            let obj = new this.objectTypes[randomIndex]({
                position:[0,10,this.player.mesh.position.z-1000]})
            this.scene.add(obj.mesh);
            this.objects.push(obj);
        } else {
            console.warn("Spawner's objectType list is empty");
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
        for (let o of this.objects.slice()) {
            if (o.mesh.position.z - 200 > this.player.mesh.position.z) {
                // object is passed the player, off the screen
                // so let's remove it from the scene
                this.scene.remove(o.mesh);
                this.objects.splice(this.objects.indexOf(o), 1);
            }
        }
    }
}