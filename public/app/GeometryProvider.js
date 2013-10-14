/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";



var THREE = require('../libs/three.js');
var QuadBuilder = require('./QuadBuilder.js');

var GeometryProvider = function (patchSize) {
    this.patchSize = patchSize;
    this.widthDir = new THREE.Vector3(1, 0, 0);
    this.heightDir = new THREE.Vector3(0, 1, 0);

    this.geometries = [];

    this.quadBuilder = new QuadBuilder();

    this.CreateGeometries();
};

GeometryProvider.prototype = {

    CreateGeometries: function () {
        this.geo = new THREE.Geometry();
        this.CreateGeometry();

        //Now create all 9 permutations of the geometry

    },

    CreateGeometry: function(){

        var step = 1 / this.patchSize;

        for(var y = 0; y <= this.patchSize; y++){

            for(var x = 0; x <= this.patchSize; x++){

                var offset = this.widthDir.clone().multiplyScalar(step).multiplyScalar(x);
                offset.add(this.heightDir.clone().multiplyScalar(step).multiplyScalar(y));

                var uv = new THREE.Vector2(x,y);

                var buildTriangles = x > 0 && y > 0;

                var swapOrder = x % 2 === y % 2;

                this.quadBuilder.BuildQuadForGrid(this.geo, offset, uv, buildTriangles, this.patchSize + 1, swapOrder);

            }

        }

    },

    GetStandardGeometry: function(){
        return this.geometry;
    }

};

module.exports = GeometryProvider;
