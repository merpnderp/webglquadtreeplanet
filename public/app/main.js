/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var Planet = require('./QuadTreeSphere.js');


var main = function () {
    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;
 //   camera.position.x = 200;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var planet = new Planet({camera: camera}).Init();

planet.add(new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10)));

    scene.add(planet);

    var pause = false;

    function render() {
        if (!pause) {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            planet.Update();
        }
    }


    render();
    setTimeout(function(){pause = !pause;}, 500);

    window.addEventListener("keypress", function (key) {
        if (key.key === "Spacebar") {
            pause = !pause;
        }
        if(! pause){
            setTimeout(render, 100);
        }
    });


};
window.addEventListener("load", main);


