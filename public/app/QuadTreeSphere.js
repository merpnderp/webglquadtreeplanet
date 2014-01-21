/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var GeometryProvider = require('./GeometryProvider.js');
var QuadTree = require('./QuadTree');

var QuadTreeSphere = function (options) {

    THREE.Object3D.call(this);


    this.control = options.control;

    this.camera = options.camera;

    this.radius = options.radius || 100;

    this.deepestNode = 0;
    this.totalNodes = 0;
    this.leafNodes = 0;

    this.patchSize = options.patchSize || 32;

    this.fov = options.fov || 30;

    this.quadTrees = [];

    this.localCameraPosition = new THREE.Vector3();

    this.geometryProvider = new GeometryProvider(this.patchSize);

    this.vs = Math.tan(this.fov / screen.width);

    this.splitTable = [];

    this.pause = false;

    this.updateMatrixWorld(true);

    this.BuildSplitTable();

};

QuadTreeSphere.prototype = Object.create(THREE.Object3D.prototype);

QuadTreeSphere.prototype.Init = function () {
    this.InitQuadTrees();
    return this;
};

QuadTreeSphere.prototype.InitQuadTrees = function () {
    var nearCorner = new THREE.Vector3(1, 1, 1).multiplyScalar(this.radius);
    var farCorner = nearCorner.clone().multiplyScalar(-1);
    var quadOptions;

    //Near quadtrees
    quadOptions = {name: "Bottom", corner: nearCorner, widthDir: new THREE.Vector3(0, 0, -1), heightDir: new THREE.Vector3(-1, 0, 0), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));
    quadOptions = {name: "Front", corner: nearCorner, widthDir: new THREE.Vector3(-1, 0, 0), heightDir: new THREE.Vector3(0, -1, 0), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));
    quadOptions = {name: "Left", corner: nearCorner, widthDir: new THREE.Vector3(0, -1, 0), heightDir: new THREE.Vector3(0, 0, -1), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));

    //Far quadtrees
    quadOptions = {name: "Top", corner: farCorner, widthDir: new THREE.Vector3(1, 0, 0), heightDir: new THREE.Vector3(0, 0, 1), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));
    quadOptions = {name: "Back", corner: farCorner, widthDir: new THREE.Vector3(0, 1, 0), heightDir: new THREE.Vector3(1, 0, 0), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));
    quadOptions = {name: "Right", corner: farCorner, widthDir: new THREE.Vector3(0, 0, 1), heightDir: new THREE.Vector3(0, 1, 0), sphere: this};
    this.quadTrees.push(new QuadTree(quadOptions));

};


QuadTreeSphere.prototype.Update = function () {

    this.deepestNode = 0;

    //Get local position of player
    this.localCameraPosition = this.worldToLocal(this.camera.position.clone());
    this.localCameraPlanetProjectionPosition = this.localCameraPosition.clone().normalize().multiplyScalar(this.radius);
    this.cameraHeight = this.localCameraPosition.distanceTo(this.position) - this.radius;

    this.localCameraMaxAngle = Math.acos(this.radius / (this.cameraHeight + this.radius));

    this.cameraHeight = this.cameraHeight > 0 ? this.cameraHeight : this.radius + 1;


   if (!this.pause) {
        this.quadTrees[0].Update();
        this.quadTrees[1].Update();
        this.quadTrees[2].Update();
        this.quadTrees[3].Update();
        this.quadTrees[4].Update();
        this.quadTrees[5].Update();
    }
};

QuadTreeSphere.prototype.Pause = function(pause){
    this.pause = pause;
};


QuadTreeSphere.prototype.AssignNeighbors = function () {

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

QuadTreeSphere.prototype.BuildSplitTable = function () {
    //size of screen pixel ≈ height · tan fov /pixels
    //minimum angle = s / r

    var patchPixelWidth, i = 0, patchSize = this.patchSize;
    while (i < 200) {

        patchPixelWidth = (Math.PI * this.radius * 2) / (patchSize * 4);
        this.splitTable[i] = patchPixelWidth / this.vs;
//        console.log(i + " : " + this.splitTable[i]);
        patchSize = patchSize * 2;
        if (this.splitTable[i] < 3) {
            this.maxLevel = i;
            break;
        }
        i++;
    }
};

module.exports = QuadTreeSphere;


