/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var OrbitControl = require('./OrbitControls');
var Planet = require('./QuadTreeSphere.js');
var Stats = require('../libs/stats.js');

var main = function () {

    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);


    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 10000000);
    camera.position.z = 400000;
    //   camera.position.x = 200;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var control = new OrbitControl(camera);
    control.zoomSpeed = 1;


    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var planet = new Planet({camera: camera, radius: 100000}).Init();

//planet.add(new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10)));

    scene.add(planet);

    var pause = false;

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        control.update();
        if (!pause) {
            planet.Update();
        }
        stats.update();
    }


    render();
//    setTimeout(function(){pause = !pause;}, 500);

    window.addEventListener("keypress", function (key) {
        if (key.key === "Spacebar") {
            pause = !pause;
            if (!pause) {
                setTimeout(render, 100);
            }
        }
    });


};
window.addEventListener("load", main);


