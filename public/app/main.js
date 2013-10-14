/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var Planet = require('./QuadTreeSphere.js');


var main = function () {
    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 10000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var planet = new Planet({camera: camera});
    console.dir(planet);
    scene.add(planet);

    camera.position.z = 5;

    function render(){
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    render();


};
window.addEventListener("load", main);

