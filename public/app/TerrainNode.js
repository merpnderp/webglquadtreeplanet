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

    this.center = this.FindCenter();
//    this.center = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
//    this.center.add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));

    this.isSplit = false;
    this.isDrawn = false;


};


TerrainNode.prototype = {

    Update: function () {

    },

    Split: function () {
        var options;
        return function () {
            options = {level: this.level + 1, parent: this, tree: this.tree};

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            this.topLeftChild = new Node(options);

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            options.position.add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.topRightChild = new Node(options);

            options.position = this.position.clone();
            this.bottomLeftChild = new Node(options);

            options.position = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.bottomRightChild = new Node(options);
        };
    }(),

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
            return new THREE.Vector3(x, y, z);
        };

    }()
};


module.exports = TerrainNode;


