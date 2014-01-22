/**
 * Created by kalebmurphy on 10/8/13.
 */


"use strict";


var THREE = require('../libs/three.js');
var fs = require('fs');

var TerrainNode = function (options) {
    this.level = options.level;
    this.parent = options.parent;
    this.tree = options.tree;
    this.position = options.position;

    //console.log(this.position.x + " : " + this.position.y + " : " + this.position.z);
    this.name = options.name;

    this.width = this.tree.sphere.radius * 2 / Math.pow(2, this.level);
    this.halfWidth = this.width / 2;
    this.arcLength = (this.width / this.tree.sphere.radius) / 1.43 //divided by fudge factor;

    //This is the node's center location after the point is projected onto the sphere.
    this.center = this.FindCenter();

    this.isSplit = false;
    this.isDrawn = false;
    this.isOccluded = false;

    this.tree.sphere.totalNodes++;

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
                } else {
                    var d = this.tree.sphere.deepestNode;
                    if (d < this.level) {
                        this.tree.sphere.deepestNode = this.level;
                    }
                }
            }
        }
    },


    Draw: function () {


        var vertex = fs.readFileSync('shaders/VertexShader.glsl');
        var frag = fs.readFileSync('shaders/FragmentShader.glsl');

        return function () {

            this.tree.sphere.leafNodes++;

            var uniforms = {Width: { type: 'f'}, Radius: { type: 'f', value: this.tree.sphere.radius},
                StartPosition: { type: 'v3'}, HeightDir: { type: 'v3'}, WidthDir: { type: 'v3'}, iColor: { type: 'v3'} };

            var mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertex, fragmentShader: frag, wireframe: true});
            //var mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertex, fragmentShader: frag, wireframe: false});

            var geo = this.tree.sphere.geometryProvider.GetStandardGeometry().clone();
            //var geo = this.tree.sphere.geometryProvider.GetStandardGeometry();


            var vertices = geo.vertices;
            for (var i = 0, l = vertices.length; i < l; i++) {
                var temp = this.tree.widthDir.clone();
                temp.multiplyScalar(vertices[i].x);
                temp.add(this.tree.heightDir.clone().multiplyScalar(vertices[i].y));
                temp.multiplyScalar(this.width);
                temp.add(this.position);
                vertices[i] = temp.normalize().multiplyScalar(this.tree.sphere.radius).add(this.tree.sphere.position);
            }

            geo.vertices = vertices;
            geo.verticesNeedUpdate = true;

            this.mesh = new THREE.Mesh(geo, mat);

            geo.computeBoundingSphere();
            geo.boundingSphere.radius = this.width * 3;
            geo.computeBoundingSphere();

            this.mesh.material.uniforms.Width.value = this.width;
            this.mesh.material.uniforms.StartPosition.value = this.position;
            this.mesh.material.uniforms.HeightDir.value = this.tree.heightDir;
            this.mesh.material.uniforms.WidthDir.value = this.tree.widthDir;

            if (this.tree.name === 'Front' || true) {
                var val = 1 / this.level + 1;
                if (this.name === 'TopLeft') {
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(val, 0, 0);
                } else if (this.name === 'TopRight') {
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0, val, 0);
                } else if (this.name === 'BottomRight') {
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0, 0, val);
                } else if (this.name === 'BottomLeft') {
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(val / 2, val / 2, 0);
                } else {
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(.5, .5, .5);
                }
            } else {
                this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0, .5, 0.5);
            }


            this.tree.sphere.scene.add(this.mesh);
            //this.tree.sphere.add(this.mesh);
            this.isDrawn = true;
        };

    }(),


    UnDraw: function () {

        this.tree.sphere.leafNodes--;

        this.tree.sphere.scene.remove(this.mesh);
        //this.tree.sphere.remove(this.mesh);

        delete this.mesh.geometry;
        delete this.mesh;

        this.isDrawn = false;

    },


    GetDistanceFromCamera: function () {
//        var center, temp, cameraProjection;
        return function () {
//            center = this.center.clone().normalize();
//            temp = this.center.clone().normalize();
//            cameraProjection = this.tree.sphere.localCameraPlanetProjectionPosition.clone().normalize();

//            console.log("Camera: " + this.tree.sphere.localCameraPosition.toArray().join(","));
//            console.log("Camera Portected: " + this.tree.sphere.localCameraPlanetProjectionPosition.toArray().join(","));
            /*
             this.distance = Math.atan2(temp.cross(cameraProjection).length(), center.dot(cameraProjection));
             this.distance *= this.tree.sphere.radius;
             this.distance -= this.width/2;
             this.distance += this.tree.sphere.cameraHeight;
             */
            this.distance = this.tree.sphere.localCameraPosition.distanceTo(this.center);
        };
    }(),


    ShouldSplit: function () {
        //console.log("\tShould " + this.level + " Split if: " + this.tree.sphere.splitTable[this.level] + " >= " + this.distance);
        return this.level < this.tree.sphere.maxLevel && this.tree.sphere.splitTable[this.level] >= this.distance;

    },


    ShouldUnSplit: function () {

        //console.log("\tShould " + this.level + " UnSplit if: " + this.tree.sphere.splitTable[this.level-1] + " < " + this.distance);
        return this.level >= 0 && this.tree.sphere.splitTable[this.level] < this.distance;

    },


    InCameraFrustum: function () {

        return true;

    },

    OccludedByHorizon: function () {
        var angleToCamera = this.tree.sphere.localCameraPlanetProjectionPosition.angleTo(this.center);

        angleToCamera -= this.arcLength;

        if (angleToCamera > this.tree.sphere.localCameraMaxAngle) {
            return true;
        }
        return false;
    },


    Split: function () {

        var options;

        return function () {
            options = {level: this.level + 1, parent: this, tree: this.tree};

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            options.name = "TopLeft";
            this.topLeftChild = new TerrainNode(options);

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            options.position.add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            options.name = "TopRight";
            this.topRightChild = new TerrainNode(options);

            options.position = this.position.clone();
            options.name = "BottomLeft";
            this.bottomLeftChild = new TerrainNode(options);

            options.position = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            options.name = "BottomRight";
            this.bottomRightChild = new TerrainNode(options);

            this.isSplit = true;

        };

    }(),


    Die: function () {
        this.tree.sphere.totalNodes--;
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
            return new THREE.Vector3(x, y, z).normalize().multiplyScalar(this.tree.sphere.radius);
        };
    }()


};


module.exports = TerrainNode;


