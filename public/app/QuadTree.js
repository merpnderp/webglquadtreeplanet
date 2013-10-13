/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var TerrainNode = require('./TerrainNode');

var QuadTree = function (options) {

    this.name = options.name;
    this.position = options.corner;
    this.widthDir = options.widthDir;
    this.heightDir = options.heightDir;
    this.sphere = options.sphere;

    this.rootNode = new TerrainNode({ parent: undefined, level: 0, tree: this, position: this.position });
};

QuadTree.prototype = {

    Update: function(){

        //Determine if this QuadTree is viewable from the camera
        //Get local position of camera
        //Get projection of camera onto this QuadTree's plane

        this.rootNode.Update();

    },

    AssignNeighbors: function(left, top, right, bottom){
        this.rootNode.leftNeighbor = left;
        this.rootNode.topNeighbor = top;
        this.rootNode.rightNeighbor = right;
        this.rootNode.bottomNeighbor = bottom;

    }

};

module.exports = QuadTree;



