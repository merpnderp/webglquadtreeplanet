/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var OrbitControl = require('./OrbitControls');
var Planet = require('./QuadTreeSphere.js');
var Stats = require('../libs/stats.js');
var Logger = require('./Logger.js');
var FlyControl = require('./FlyControls');

var main = function () {

    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);

    var logger = new Logger();
    logger.domElement.style.position = 'absolute';
    logger.domElement.style.top = '100px';
    logger.domElement.style.zIndex = 100;
    document.body.appendChild(logger.domElement);

    //var planetRadius = 9.46e23; // 100,000 light years
    //var planetRadius = 695500000; // sun sized
    var planetRadius = 6376136; // earth sized
    //var planetRadius = 1737000; // moon sized
    //var planetRadius = 7000; // half moon sized
    //var planetRadius = 370; // 624 Hektor Asteroid
    //var planetRadius = .1; // 4 inches

    var fov = 60;

    var camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 7000000);
    camera.position.z = planetRadius * -4;
    //   camera.position.x = 200;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

//    var control = new OrbitControl(camera);
//    control.zoomSpeed = 1;

    var control = new FlyControl(camera);
    var controlMaxSpeed = 1000000;
    control.movementSpeed = controlMaxSpeed;
    control.domElement = document.body;
    control.rollSpeed = Math.PI / 6;
    control.autoForward = false;
    control.dragToLook = false;


    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
//		renderer.setClearColor( 0xffffff, 1) 
    document.getElementById('viewport').appendChild(renderer.domElement);

    var planet = new Planet({camera: camera, radius: planetRadius, patchSize: 32, control: control, scene: scene });
    planet.Init();
    scene.add(planet);

//planet.add(new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10)));

    var pause = false;

    var clock = new THREE.Clock();
    var workClock = new THREE.Clock();
    var updateClock = new THREE.Clock();
    var delta;
    var origin = new THREE.Vector3();
    var updateSpeedMax = 0, temp = 0, updateSpeedAvg = 0, count = 0, updateSpeedAvgShow = 0;
    function render() {
        delta = clock.getDelta();

        requestAnimationFrame(render);

        renderer.render(scene, camera);

        control.update(delta);
        UpdateToLocal();


        updateClock.getDelta();
        planet.Update();
        temp = updateClock.getDelta();
        if(temp > updateSpeedMax)updateSpeedMax = temp;

        updateSpeedAvg += temp;
        count++;
        if(count > 60){
           count = 0;
            updateSpeedAvgShow = updateSpeedAvg/60;
            updateSpeedAvg = 0;
        }

        control.movementSpeed = planet.cameraHeight * 2;

        stats.update();


//        control.zoomSpeed = planet.control.zoomSpeed > 1 ? 1 : this.control.zoomSpeed;


        logger.Log("Geometries ", renderer.info.memory.geometries);
        logger.Log("Textures ", renderer.info.memory.textures);
        logger.Log("Calls ", renderer.info.render.calls);
        logger.Log("Vertices ", renderer.info.render.vertices);
        logger.Log("Deepest Level ", planet.deepestNode);
        logger.Log("Total Nodes ", planet.totalNodes);
        logger.Log("Total Leaf Nodes ", planet.leafNodes);
        logger.Log("CameraHeight (meters) ", Math.round(planet.cameraHeight));
        logger.Log("CameraHeight (miles) ", Math.round(planet.cameraHeight * 0.000621371));
        logger.Log("CameraPosition: ", camera.position);
        logger.Log("Quad UpdateSpeed Max: ", updateSpeedMax.toFixed(6));
        logger.Log("Quad UpdateSpeed Avg: ", updateSpeedAvgShow.toFixed(6));

    }

    function UpdateToLocal() {
        if (camera.position.length() > 100000) {
            workClock.getDelta();
            origin = origin.subVectors(camera.position, origin);
            scene.children.forEach(function (child) {
                child.position.sub(origin);
            });
            //planet.position.sub(origin);
            origin.x = 0;
            origin.y = 0;
            origin.z = 0;
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 0;
        }
    }

    render();

    window.addEventListener("keypress", function (key) {
        if (key.key === "Spacebar") {
            pause = !pause;
            planet.Pause(pause);
        }

    });


};
window.addEventListener("load", main);


