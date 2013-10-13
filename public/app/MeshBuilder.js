/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');

var MeshBuilder = function(){
    this.vertices = [];
    this.normals = [];
    this.uvs = [];
    this.faces = [];
};

MeshBuilder.prototype = {

    AddTriangle: function(index0, index1, index2){
        triangles.add(index0);
        triangles.add(index1);
        triangles.add(index2);
    },

    CreateMesh: function(){
        var geo = new THREE.Geometry();
        geo.vertices = this.vertices;
        geo.faces = this.faces;

        if(this.normals.length === this.vertices.length){
            geo.normals = this.normals;
        }

        if(this.uvs.length === this.vertices.length){
            for(var i = 0; i < this.uvs.length; i += 3){
                geo.faceVertexUvs[0].add([this.uvs[i], this.uvs[i+1], this.uvs[i+2]]);
            }
        }

    }

};
