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
    this.name = options.name;

    this.width = this.tree.sphere.radius * 2 / Math.pow(2, this.level);
    this.halfWidth = this.width / 2;

    //This is the node's center location after the point is projected onto the sphere.
    this.center = this.FindCenter();

    this.isSplit = false;
    this.isDrawn = false;

};


TerrainNode.prototype = {


    Update: function () {

        if (this.InCameraFrustum()) {
//            console.log("Node: " + this.name);
            this.GetDistanceFromCamera();
//console.log(this.tree.sphere.cameraHeight + " : " + this.distance);
            //Not split but should
            if (!this.isSplit && this.ShouldSplit()) {

                //If this is drawn, undraw
                if (this.isDrawn) {

                    this.UnDraw();

                }
//                console.log("Splitting");
                this.Split();

                //Should unsplit
            } else if (this.ShouldUnSplit()) {
//                console.log("Unsplitting");
                this.UnSplit();

                //Not split and not drawn
            } else if (!this.isSplit && !this.isDrawn) {
//                console.log("Drawning");
                this.Draw();

                //If split, update
            } else if (this.isSplit) {
//                console.log("Updating children");
                this.UpdateChildren();

            } else {
//                console.log("I'm already drawn");
            }
        }

    },


    Draw: function () {

        var vertex = fs.readFileSync('shaders/VertexShader.glsl');
        var frag = fs.readFileSync('shaders/FragmentShader.glsl');

        return function () {
            var uniforms = {Width: { type: 'f'}, Radius: { type: 'f', value: this.tree.sphere.radius},
                StartPosition: { type: 'v3'}, HeightDir: { type: 'v3'}, WidthDir: { type: 'v3'}, iColor: { type: 'v3'} };
            var mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertex, fragmentShader: frag});

            this.mesh = new THREE.Mesh(this.tree.sphere.geometryProvider.GetStandardGeometry(), mat);
            this.mesh.material.uniforms.Width.value = this.width;
            this.mesh.material.uniforms.StartPosition.value = this.position;
            this.mesh.material.uniforms.HeightDir.value = this.tree.heightDir;
            this.mesh.material.uniforms.WidthDir.value = this.tree.widthDir;

            if(this.tree.name === 'Front'){
                var val = 1/this.level + 1;
                if(this.name === 'TopLeft'){
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(val,0,0);
                }else if(this.name === 'TopRight'){
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0,val,0);
                }else if(this.name === 'BottomRight'){
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0,0,val);
                }else if(this.name === 'BottomRight'){
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(val/2,val/2,val/2);
                }else{
                    this.mesh.material.uniforms.iColor.value = new THREE.Vector3(.5,.5,.5);
                }
            }else{
                this.mesh.material.uniforms.iColor.value = new THREE.Vector3(0,.5,0.5);
            }


            this.tree.sphere.add(this.mesh);
            this.isDrawn = true;
        };

    }(),


    UnDraw: function () {

        this.tree.sphere.child.remove(this.mesh);
        delete this.mesh;
        this.isDrawn = false;

    },


    GetDistanceFromCamera: function () {
        var center, cameraProjection, temp;
        return function () {
            center = this.center.clone().normalize();
            temp = this.center.clone().normalize();
            cameraProjection = this.tree.sphere.localCameraPlanetProjectionPosition.clone().normalize();

//            console.log("Camera: " + this.tree.sphere.localCameraPosition.toArray().join(","));
//            console.log("Camera Portected: " + this.tree.sphere.localCameraPlanetProjectionPosition.toArray().join(","));

            this.distance = Math.atan2(temp.cross(cameraProjection).length(), center.dot(cameraProjection));
            this.distance *= this.tree.sphere.radius;
            this.distance += this.tree.sphere.cameraHeight;
        };
    }(),


    ShouldSplit: function () {
//        console.log("\tShould Split if: " + this.distance + " < " + this.tree.sphere.splitTable[this.level]);
        return this.tree.sphere.splitTable[this.level] > this.distance;

    },


    ShouldUnSplit: function () {

//        console.log("\tShould UnSplit if: " + this.level + " > 0 && " + this.distance + " > " + this.tree.sphere.splitTable[this.level - 1]);
        return this.level > 0 && this.tree.sphere.splitTable[this.level - 1] < this.distance;

    },


    InCameraFrustum: function () {

        return true;

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


