/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var MeshProvider = require('./MeshProvider');
var QuadTree = require('./QuadTree');

var QuadTreeSphere = function (options) {

    THREE.Object3D.call(this);

    this.radius = options.radius || 100;

    this.patchSize = options.patchSize || 32;

    this.camera = options.camera;

    this.quadTrees = [];

    this.localCameraPosition;

    this.meshProvider = new MeshProvider(this.patchSize);

    this.maxLevel = parseInt(Math.log(this.radius * 2), 10);
    this.maxLevel -= parseInt(Math.log(Math.pow(this.patchSize, 2)), 10);
    this.maxLevel = this.maxLevel < 0 ? 0 : this.maxLevel;

    this.InitQuadTrees();
};

QuadTree.prototype = Object.create( THREE.Object3D.prototype );

QuadTree.prototype = {

    InitQuadTrees: function () {
        var nearCorner = new THREE.Vector3(1, 1, 1).multiplyScalar(this.radius);
        var farCorner = nearCorner.clone().multiplyScalar(-1);
        var quadOptions;

        //Near quadtrees
        quadOptions = {name: "Bottom", corner: nearCorner, widthDir: new THREE.Vector3(0, 0, -1), heightDir: new THREE.Vector3(-1, 0, 0), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));
        quadOptions = {name: "Front", corner: nearCorner, widthDir: new THREE.Vector3(-1, 0, 0), heightDir: new THREE.Vector3(0, -1, 0), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));
        quadOptions = {name: "Left", corner: nearCorner, widthDir: new THREE.Vector3(0, -1, 0), heightDir: new THREE.Vector3(0, 0, -1), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));

        //Far quadtrees
        quadOptions = {name: "Top", corner: farCorner, widthDir: new THREE.Vector3(1, 0, 0), heightDir: new THREE.Vector3(0, 0, 1), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));
        quadOptions = {name: "Back", corner: farCorner, widthDir: new THREE.Vector3(0, 1, 0), heightDir: new THREE.Vector3(1, 0, 0), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));
        quadOptions = {name: "Right", corner: farCorner, widthDir: new THREE.Vector3(0, 0, 1), heightDir: new THREE.Vector3(0, 1, 0), sphere: this};
        this.quadTrees.add(new QuadTree(quadOptions));
    },


    Update: function () {
        //Get local position of player
        this.localCameraPosition = this.worldToLocal(this.camera.position);

    },


    AssignNeighbors: function () {
        var bottom = this.quadTrees[0];
        var front = this.quadTrees[1];
        var left = this.quadTrees[2];
        var top = this.quadTrees[3];
        var back = this.quadTrees[4];
        var right = this.quadTrees[5];

        this.quadTrees[0].AssignNeighbors(left, back, right, front);
        this.quadTrees[0].AssignNeighbors(left, top, right, bottom);
        this.quadTrees[0].AssignNeighbors(bottom, back, top, front);
        this.quadTrees[0].AssignNeighbors(right, front, left, back);
        this.quadTrees[0].AssignNeighbors(top, left, bottom, right);
        this.quadTrees[0].AssignNeighbors(back, bottom, front, top);
    }
};


module.exports = QuadTreeSphere;


