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
                    this.Split();
                    this.UpdateChildren();
                } else if (!this.isDrawn) {
                    this.ShouldDraw();
                }
            }
        }
    },

    CheckNeighbors: function () {

        if (this.isSplit) {
            if(this.level > 0){
                this.parent.SplitNeighbors(this.level);
                this.AssignNeighbors();
            }
            this.CheckChildrenNeighbors();
            return;
        }

        if(this.shouldDraw && this.level > 0){
            this.parent.EnsureNeighborsAreDrawnOrSplit();
        }


    },

    EnsureNeighborsAreDrawnOrSplit: function(){
        if(!this.topNeighbor.isSplit && !this.topNeighbor.shouldDraw){
            this.topNeighbor.ShouldDraw();
        }
        if(!this.rightNeighbor.isSplit && !this.rightNeighbor.shouldDraw){
            this.rightNeighbor.ShouldDraw();
        }
        if(!this.bottomNeighbor.isSplit && !this.bottomNeighbor.shouldDraw){
            this.bottomNeighbor.ShouldDraw();
        }
        if(!this.leftNeighbor.isSplit && !this.leftNeighbor.shouldDraw){
            this.leftNeighbor.ShouldDraw();
        }
    },

    SplitNeighbors: function (splitLevel) {
        if (this.topNeighbor.level < splitLevel) {
            this.topNeighbor.Split();
        }
        if (this.rightNeighbor.level < splitLevel) {
            this.rightNeighbor.Split();
        }
        if (this.bottomNeighbor.level < splitLevel) {
            this.bottomNeighbor.Split();
        }
        if (this.leftNeighbor.level < splitLevel) {
            this.leftNeighbor.Split();
        }
    },

    ShouldDraw: function () {
        if(this.shouldDraw === true){
            return;
        }
        this.tree.planet.meshesMightAdd.push({name: this.name, draw: this.Draw.bind(this)});
        this.shouldDraw = true;
    },

    Draw: function () {

        var position;

        return function () {
            "use strict";
            var positions = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 3);
            var normals = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 3);
            var uvs = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 2);

            var positionCount = 0;
            var uvsCount = 0;

            var patchSize = this.tree.planet.patchSize;

            for (var u = 0; u < patchSize; u++) {
                for (var v = 0; v < patchSize; v++) {
                    position = this.SolvePoint(u / patchSize, v / patchSize);
                    positions[positionCount++] = position.x;
                    normals[positionCount - 1] = positions[positionCount - 1];
                    positions[positionCount++] = position.y;
                    normals[positionCount - 1] = positions[positionCount - 1];
                    positions[positionCount++] = position.z;
                    normals[positionCount - 1] = positions[positionCount - 1];
                    uvs[uvsCount++] = u / patchSize;
                    uvs[uvsCount++] = v / patchSize;


                    position = this.SolvePoint((u + 1) / patchSize, (v) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = v / patchSize;

                    position = this.SolvePoint((u) / patchSize, (v + 1) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;

                    positions[positionCount++] = positions[positionCount - 4];
                    positions[positionCount++] = positions[positionCount - 4];
                    positions[positionCount++] = positions[positionCount - 4];
                    uvs[uvsCount++] = (u) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;

                    positions[positionCount++] = positions[positionCount - 10];
                    positions[positionCount++] = positions[positionCount - 10];
                    positions[positionCount++] = positions[positionCount - 10];
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = (v) / patchSize;

                    position = this.SolvePoint((u + 1) / patchSize, (v + 1) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;
                }
            }

            this.tree.planet.meshesToAdd.push(positions.buffer);
            this.tree.planet.meshesToAdd.push(normals.buffer);
            this.tree.planet.meshesToAdd.push(uvs.buffer);
            //this.tree.planet.returnObject.newMeshes.push({name: this.name, center: this.center, positions: positions, uvs: uvs, normals: normals});
            this.tree.planet.returnObject.newMeshes.push({name: this.name, width: this.width, center: this.center, positions: positions, uvs: uvs});

            this.isDrawn = true;
        };

    }(),

    SolvePoint: function () {
        var x, y, z, length;
        return function (u, v) {
            "use strict";
            /*
             var temp = this.tree.widthDir.clone();
             temp.multiplyScalar(u);
             temp.add(this.tree.heightDir.clone().multiplyScalar(v));
             temp.multiplyScalar(this.width);
             temp.add(this.position);
             temp.normalize();
             temp.multiplyScalar(this.tree.planet.radius);
             return temp;
             */
            /*
             width = this.width;
             wx = this.tree.widthDir.x;
             wy = this.tree.widthDir.y;
             wz = this.tree.widthDir.z;
             hx = this.tree.heightDir.x;
             hy = this.tree.heightDir.y;
             hz = this.tree.heightDir.z;
             */
            x = ((this.tree.widthDir.x * u + this.tree.heightDir.x * v) * this.width) + this.position.x;
            y = ((this.tree.widthDir.y * u + this.tree.heightDir.y * v) * this.width) + this.position.y;
            z = ((this.tree.widthDir.z * u + this.tree.heightDir.z * v) * this.width) + this.position.z;

            length = Math.sqrt(x * x + y * y + z * z);

            x = (x / length) * this.tree.planet.radius - this.center.x;
            y = (y / length) * this.tree.planet.radius - this.center.y;
            z = (z / length) * this.tree.planet.radius - this.center.z;

            return {x: x, y: y, z: z};

        }
    }(),


    UnDraw: function () {
        this.tree.planet.RemoveFromMeshesMightAdd(this.name);
        this.shouldDraw = false;

        this.tree.planet.returnObject.deletedMeshes.push(this.name);
        this.isDrawn = false;

    },


    GetDistanceFromCamera: function () {
        return function () {
            this.distance = this.tree.planet.localCameraPosition.distanceTo(this.center);
        };
    }(),


    ShouldSplit: function () {
        return this.level < this.tree.planet.maxLevel && this.tree.planet.splitTable[this.level] >= this.distance;

    },


    ShouldUnSplit: function () {

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
            if (this.isSplit) {
                return;
            }

            if (this.isDrawn) {
                this.UnDraw();
            }

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

    AssignNeighbors: function () {

        this.topLeftChild.topNeighbor = this.parent.topNeighbor.bottomLeftChild;
        this.topLeftChild.rightNeighbor = this.topRightChild;
        this.topLeftChild.bottomNeighbor = this.bottomLeftChild;
        this.topLeftChild.leftNeighbor = this.parent.leftNeighbor.topRightChild;

        this.topRightChild.topNeighbor = this.parent.topNeighbor.bottomRightChild;
        this.topRightChild.rightNeighbor = this.parent.rightNeighbor.topLeftChild;
        this.topRightChild.bottomNeighbor = this.bottomRightChild;
        this.topRightChild.leftNeighbor = this.topLeftChild;

        this.bottomLeftChild.topNeighbor = this.topLeftChild;
        this.bottomLeftChild.rightNeighbor = this.bottomRightChild;
        this.bottomLeftChild.bottomNeighbor = this.parent.bottomNeighbor.topLeftChild;
        this.bottomLeftChild.leftNeighbor = this.parent.leftNeighbor.bottomRightChild;

        this.bottomRightChild.topNeighbor = this.topRightChild;
        this.bottomRightChild.rightNeighbor = this.parent.rightNeighbor.bottomLeftChild;
        this.bottomRightChild.bottomNeighbor = this.parent.bottomNeighbor.topRightChild;
        this.bottomRightChild.leftNeighbor = this.bottomLeftChild;

    },


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


    UpdateChildren: function () {

        this.topLeftChild.Update();
        this.topRightChild.Update();
        this.bottomLeftChild.Update();
        this.bottomRightChild.Update();

    },

    CheckChildrenNeighbors: function () {

        this.topLeftChild.CheckNeighbors();
        this.topRightChild.CheckNeighbors();
        this.bottomLeftChild.CheckNeighbors();
        this.bottomRightChild.CheckNeighbors();

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


