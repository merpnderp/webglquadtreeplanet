/**
 * Created by kalebmurphy on 10/8/13.
 */


"use strict";


var THREE = require('../libs/three.js');


var TerrainNode = function (options) {
    this.level = options.level;
    this.parent = options.parent;
    this.tree = options.tree;
    this.position = options.position;

    this.width = this.tree.sphere.radius * 2 / Math.pow(2, this.level);
    this.halfWidth = this.width / 2;

    //This is the node's center location after the point is projected onto the sphere.
    this.center = this.FindCenter();
//    this.center = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
//    this.center.add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));

    this.isSplit = false;
    this.isDrawn = false;

};


TerrainNode.prototype = {

    Update: function () {
        if (this.InCameraFrustum()) {
            this.GetDistanceFromCamera();
            if (this.ShouldSplit()) {
                if(this.isDrawn){
                    this.UnDraw();
                }
                this.Split();
            } else if (this.ShouldUnSplit()) {
                this.UnSplit();
            } else if (! this.isSplit && !this.isDrawn) {
                this.Draw();
            } else if (this.isSplit){
                this.UpdateChildren();
            }
        }
    },

    Draw: function () {
        this.mesh = new THREE.Mesh(this.tree.sphere.geometryProvider.GetStandardGeometry());
        this.tree.sphere.add(this.mesh);
        this.isDrawn = true;
        console.log("Drawing");
    },

    UnDraw: function () {
        this.tree.sphere.child.remove(this.mesh);
        delete this.mesh;
        this.isDrawn = false;
        console.log('UnDrawing');
    },

    GetDistanceFromCamera: function () {
        this.distance = Math.acos(this.center.dot(this.tree.sphere.localCameraPlanetProjectionPosition)) + this.tree.sphere.cameraHeight;
    },

    ShouldSplit: function () {
        return this.tree.sphere.splitTable[this.level] > this.distance;
    },

    ShouldUnSplit: function () {
        return this.level === 0 || this.tree.sphere.splitTable[this.level - 1] < this.distance ? false : true;
    },

    InCameraFrustum: function () {
        return true;
    },

    Split: function () {
        var options;
        return function () {
            options = {level: this.level + 1, parent: this, tree: this.tree};

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            this.topLeftChild = new TerrainNode(options);

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            options.position.add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.topRightChild = new TerrainNode(options);

            options.position = this.position.clone();
            this.bottomLeftChild = new TerrainNode(options);

            options.position = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.bottomRightChild = new TerrainNode(options);

            this.isSplit = true;
        };
    }(),

    Die: function () {
        if (this.isDrawn) {
            this.UnDraw();
        } else if (this.isSplit) {
            this.UnSplit();
        }
    },

    UnSplit: function () {
        if (this.isSplit) {
            this.topLeftChild.Die();
            this.topRightChild.Die();
            this.bottomLeftChild.Die();
            this.bottomRightChild.Die();
            delete this.topLeftChild;
            delete this.topRightChild;
            delete this.bottomLeftChild;
            delete this.bottomRightChild;
        }
        this.isSplit = false;
    },

    UpdateChildren: function(){
        this.topLeftChild.Update();
        this.topRightChild.Update();
        this.bottomLeftChild.Update();
        this.bottomRightChild.Update();
    },

    FindCenter: function () {
        var x, y, z, w, wd, hd;

        return function () {
            x = this.position.x;
            y = this.position.y;
            z = this.position.z;
            wd = this.tree.widthDir;
            hd = this.tree.heightDir;
            w = this.halfWidth;

            x = x + wd.x * w + hd.x * w;
            y = y + wd.y * w + hd.y * w;
            z = z + wd.z * w + hd.z * w;
            return new THREE.Vector3(x, y, z).normalize().multiplyScalar(this.tree.sphere.radius);
        };
    }()
};


module.exports = TerrainNode;


