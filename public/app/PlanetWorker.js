/**
 * Created by kalebmurphy on 2/16/14.
 */

var QuadTree = require('./QuadTree');
var THREE = require('../libs/three.js');
var GeometryProvider = require('./GeometryProvider');

var PlanetWorker = function () {
};

var worker = new PlanetWorker();

PlanetWorker.prototype.Update = function (data) {
    self.postMessage({log: "Worker says Update called"});
    this.returnObject = {started: Date.now(), newMeshes: [], deletedMeshes: []};
    this.meshesMightAdd = [];
    this.meshesToAdd = [];


    //Get local position of player
    this.localCameraPosition = new THREE.Vector3(data.localCameraPosition.x, data.localCameraPosition.y, data.localCameraPosition.z);
    this.localCameraPlanetProjectionPosition = this.localCameraPosition.clone().normalize().multiplyScalar(this.radius);
    //this.cameraHeight = this.localCameraPosition.distanceTo(this.position) - this.radius;
    this.cameraHeight = this.localCameraPosition.length() - this.radius;

    this.localCameraMaxAngle = Math.acos(this.radius / (this.cameraHeight + this.radius));

    this.cameraHeight = this.cameraHeight > 0 ? this.cameraHeight : this.radius + 1;
    this.log = function (text) {
        self.postMessage({log: text});
    };
    this.quadTrees.forEach(function (tree) {
        tree.Update();
    });

    this.meshesMightAdd.forEach(function(mesh){
        mesh.draw();
    });

    this.returnObject['finished'] = Date.now() - this.returnObject.started;
    self.postMessage(this.returnObject, this.meshesToAdd);

};


PlanetWorker.prototype.Init = function (data) {
    self.postMessage({log: "Worker says Init called"});
    this.radius = data.radius;
    this.patchSize = data.patchSize;
    this.fov = data.fov;
    this.geometryProvider = new GeometryProvider(this.patchSize);
    this.vs = Math.tan(this.fov / data.screenWidth);
    this.quadTrees = [];
    this.splitTable = [];
    this.BuildSplitTable();
    this.InitQuadTrees();
    self.postMessage({inited: true});
};

self.onmessage = function (event) {
    if (event.data.Init) {
        worker.Init(event.data.Init);
    }
    if (event.data.Update) {
        worker.Update(event.data.Update);
    }
};

PlanetWorker.prototype.BuildSplitTable = function () {
    var patchPixelWidth, i = 0, patchSize = this.patchSize;
    self.postMessage({log: 'Starting buildsplittable: ' + this.vs.toString() + "\n"});
    while (i < 200) {
        patchPixelWidth = (Math.PI * this.radius * 2) / (patchSize * 6);
        this.splitTable[i] = patchPixelWidth / this.vs;
        self.postMessage({log: "building splitTable:" + this.splitTable[i]});
        patchSize = patchSize * 2;
        if (this.splitTable[i] < 3) {
            this.maxLevel = i;
            break;
        }
        i++;
    }
    self.postMessage({log: "building splitTable" + this.maxLevel});
};

PlanetWorker.prototype.InitQuadTrees = function () {
    var nearCorner = new THREE.Vector3(1, 1, 1).multiplyScalar(this.radius);
    var farCorner = nearCorner.clone().multiplyScalar(-1);
    //Near quadtrees
    this.quadTrees.push(new QuadTree({name: "Bottom", corner: nearCorner, widthDir: new THREE.Vector3(0, 0, -1), heightDir: new THREE.Vector3(-1, 0, 0), planet: this}));
    this.quadTrees.push(new QuadTree({name: "Front", corner: nearCorner, widthDir: new THREE.Vector3(-1, 0, 0), heightDir: new THREE.Vector3(0, -1, 0), planet: this}));
    this.quadTrees.push(new QuadTree({name: "Left", corner: nearCorner, widthDir: new THREE.Vector3(0, -1, 0), heightDir: new THREE.Vector3(0, 0, -1), planet: this}));
    //Far quadtrees
    this.quadTrees.push(new QuadTree({name: "Top", corner: farCorner, widthDir: new THREE.Vector3(1, 0, 0), heightDir: new THREE.Vector3(0, 0, 1), planet: this}));
    this.quadTrees.push(new QuadTree({name: "Back", corner: farCorner, widthDir: new THREE.Vector3(0, 1, 0), heightDir: new THREE.Vector3(1, 0, 0), planet: this}));
    this.quadTrees.push(new QuadTree({name: "Right", corner: farCorner, widthDir: new THREE.Vector3(0, 0, 1), heightDir: new THREE.Vector3(0, 1, 0), planet: this}));

};


PlanetWorker.prototype.AssignNeighbors = function () {
    var bottom = this.quadTrees[0];
    var front = this.quadTrees[1];
    var left = this.quadTrees[2];
    var top = this.quadTrees[3];
    var back = this.quadTrees[4];
    var right = this.quadTrees[5];

    this.quadTrees[0].AssignNeighbors(left, back, right, front);
    this.quadTrees[1].AssignNeighbors(left, top, right, bottom);
    this.quadTrees[2].AssignNeighbors(bottom, back, top, front);
    this.quadTrees[3].AssignNeighbors(right, front, left, back);
    this.quadTrees[4].AssignNeighbors(top, left, bottom, right);
    this.quadTrees[5].AssignNeighbors(back, bottom, front, top);
};





