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

    //console.log(this.position.x + " : " + this.position.y + " : " + this.position.z);

    this.width = this.tree.planet.radius * 2 / Math.pow(2, this.level);
    this.halfWidth = this.width / 2;
    this.arcLength = (this.width / this.tree.planet.radius) / 1.43 //divided by fudge factor;

    //This is the node's center location after the point is projected onto the sphere.
    this.center = this.FindCenter();
    this.name = this.center.x + ":" + this.center.y + ":" + this.center.z;

    this.isSplit = false;
    this.isDrawn = false;
    this.isOccluded = false;

};


TerrainNode.prototype = {


    Update: function () {
        if (this.OccludedByHorizon()) {
            this.isOccluded = true;
            if (this.isSplit) {
                this.UnSplit();
            } else if (this.isDrawn) {
                this.UnDraw();
            }
        } else {
            this.isOccluded = false;
            if (this.InCameraFrustum()) {
                this.GetDistanceFromCamera();
                if (this.isSplit) {
                    if (this.ShouldUnSplit()) {
                        this.UnSplit();
                        this.Update();
                    } else {
                        this.UpdateChildren();
                    }
                } else if (this.ShouldSplit()) {
                    if (this.isDrawn) {
                        this.UnDraw();
                    }
                    this.Split();
                    this.UpdateChildren();
                } else if (!this.isDrawn) {
                    this.Draw();
                }
            }
        }
    },


    Draw: function () {

        var position;

        return function () {

            var positions = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 3);
            var uvs = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 2);

            var positionCount = 0;
            var uvsCount = 0;

            var patchSize = this.tree.planet.patchSize;

            for(var u = 0; u < patchSize; u++){
                for(var v = 0; v < patchSize; v++){
                    position = this.SolvePoint(u/patchSize, v/patchSize, patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = u/patchSize;
                    uvs[uvsCount++] = v/patchSize;

                    position = this.SolvePoint((u+1)/patchSize, (v)/patchSize, patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u+1)/patchSize;
                    uvs[uvsCount++] = v/patchSize;

                    position = this.SolvePoint((u)/patchSize, (v+1)/patchSize, patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u)/patchSize;
                    uvs[uvsCount++] = (v+1)/patchSize;

                    positions[positionCount++] = positions[positionCount - 7];
                    positions[positionCount++] = positions[positionCount - 7];
                    positions[positionCount++] = positions[positionCount - 7];
                    uvs[uvsCount++] = (u)/patchSize;
                    uvs[uvsCount++] = (v+1)/patchSize;

                    positions[positionCount++] = positions[positionCount - 7];
                    positions[positionCount++] = positions[positionCount - 7];
                    positions[positionCount++] = positions[positionCount - 7];
                    uvs[uvsCount++] = (u+1)/patchSize;
                    uvs[uvsCount++] = (v)/patchSize;

                    position = this.SolvePoint((u+1)/patchSize, (v+1)/patchSize, patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u+1)/patchSize;
                    uvs[uvsCount++] = (v+1)/patchSize;
                }
            }

            this.tree.planet.meshesToAdd.push(positions.buffer);
            this.tree.planet.meshesToAdd.push(uvs.buffer);
            this.tree.planet.returnObject.newMeshes.push({name: this.name, center: this.center, positions: positions, uvs: uvs});

            this.isDrawn = true;
        };

    }(),

    SolvePoint: function(){
        var temp;
        return function(u,v, patchSize){
            temp = this.tree.widthDir.clone();
            temp.multiplyScalar(u/patchSize);
            temp.add(this.tree.heightDir.clone().multiplyScalar(v/patchSize));
            temp.multiplyScalar(this.width);
            temp.add(this.position);
            temp.normalize();
            temp.multiplyScalar(this.tree.planet.radius);
            return temp;
        }
    }(),


    UnDraw: function () {

        this.tree.planet.deletedMeshes.add(this.name);
        this.isDrawn = false;

    },


    GetDistanceFromCamera: function () {
        return function () {
            this.distance = this.tree.planet.localCameraPosition.distanceTo(this.center);
        };
    }(),


    ShouldSplit: function () {
        //console.log("\tShould " + this.level + " Split if: " + this.tree.sphere.splitTable[this.level] + " >= " + this.distance);
        return this.level < this.tree.planet.maxLevel && this.tree.planet.splitTable[this.level] >= this.distance;

    },


    ShouldUnSplit: function () {

        //console.log("\tShould " + this.level + " UnSplit if: " + this.tree.sphere.splitTable[this.level-1] + " < " + this.distance);
        return this.level >= 0 && this.tree.planet.splitTable[this.level] < this.distance;

    },


    InCameraFrustum: function () {

        return true;

    },

    OccludedByHorizon: function () {
        var angleToCamera = this.tree.planet.localCameraPlanetProjectionPosition.angleTo(this.center);

        angleToCamera -= this.arcLength;

        if (angleToCamera > this.tree.planet.localCameraMaxAngle) {
            return true;
        }
        return false;
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
        this.tree.planet.totalNodes--;
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


    UpdateChildren: function () {

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
            return new THREE.Vector3(x, y, z).normalize().multiplyScalar(this.tree.planet.radius);
        };
    }()


};


module.exports = TerrainNode;


