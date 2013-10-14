/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var GeometryProvider = require('./GeometryProvider.js');
var QuadTree = require('./QuadTree');

var QuadTreeSphere = function (options) {

    THREE.Object3D.call(this);

    this.camera = options.camera;

    this.radius = options.radius || 100;

    this.patchSize = options.patchSize || 32;

    this.fov = options.fov || 30;

    this.quadTrees = [];

    this.localCameraPosition = new THREE.Vector3();

    this.geometryProvider = new GeometryProvider(this.patchSize);

    this.vs = Math.tan(this.fov / screen.width);

    this.maxLevel = parseInt(Math.log(this.radius * 2), 10);
    this.maxLevel -= parseInt(Math.log(Math.pow(this.patchSize, 2)), 10);
    this.maxLevel = this.maxLevel < 0 ? 0 : this.maxLevel;

    this.splitTable = [];

};

QuadTreeSphere.prototype = Object.create(THREE.Object3D.prototype);

QuadTreeSphere.prototype.Init = function () {
    this.BuildSplitTable();
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

    //Get local position of player
    this.localCameraPosition = this.worldToLocal(this.camera.clone().position);
    this.localCameraPlanetProjectionPosition = this.localCameraPosition.normalize().multiplyScalar(this.radius);
    this.cameraHeight = this.localCameraPosition.distanceTo(this.position) - this.radius;

    this.quadTrees[0].Update();
    this.quadTrees[1].Update();
    this.quadTrees[2].Update();
    this.quadTrees[3].Update();
    this.quadTrees[4].Update();
    this.quadTrees[5].Update();
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
    var t, i = 0;
    while (true) {
        t = (Math.PI / 2) / Math.pow(2, i);
        this.splitTable[i] = (t / this.patchSize) * this.radius / this.vs;
        if (this.splitTable[i] < 0.1) {
            break;
        }
        i++;
    }
};

module.exports = QuadTreeSphere;


