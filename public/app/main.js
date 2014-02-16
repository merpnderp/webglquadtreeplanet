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
    //var planetRadius = 370; // 624 Hektor Asteroid
    //var planetRadius = .1; // 4 inches

    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 7000000);
    camera.position.z = planetRadius * 2;
    //   camera.position.x = 200;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

//    var control = new OrbitControl(camera);
//    control.zoomSpeed = 1;

    var control = new FlyControl(camera);
    var controlMaxSpeed = 1000000;
    control.movementSpeed = controlMaxSpeed;
    control.domElement = document.body;
    control.rollSpeed = Math.PI / 12;
    control.autoForward = false;
    control.dragToLook = false;


    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
//		renderer.setClearColor( 0xffffff, 1) 
    document.getElementById('viewport').appendChild(renderer.domElement);

    var planet = new Planet({camera: camera, radius: planetRadius, patchSize: 35, control: control, scene: scene });
    planet.Init();
    scene.add(planet);

//planet.add(new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10)));

    var pause = false;

    var clock = new THREE.Clock();
    var clockTest = new THREE.Clock();
    var updateClock = new THREE.Clock();
    var delta;
    var origin = new THREE.Vector3();

    var planetUpdate = 0, del = 0, renderUpdate = 0, updateUpdate = 0, count = 0;

    var renderAverage = 0, planetAverage = 0, updateAverage = 0;

    function render() {
        count++;
        updateClock.getDelta();
        delta = clock.getDelta();

        requestAnimationFrame(render);

        control.update(delta);

        clockTest.getDelta();
        renderer.render(scene, camera);
        del = clockTest.getDelta();
        renderAverage += del;
        if (del > renderUpdate && count > 15) {
            renderUpdate = del;
        }

        planet.Update();

        del = clockTest.getDelta();
        planetAverage += del;
        if (del > planetUpdate && count > 15) {
            planetUpdate = del;
        }

        control.movementSpeed = planet.cameraHeight * 2;

        stats.update();

        clockTest.getDelta();
        UpdateToLocal();

        del = clockTest.getDelta();
        updateAverage += del;
        if (del > summaryAverage && count > 15) {
            summaryAverage = del;
        }
        if (count % 30 === 0) {


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
            logger.Log("PlanetPosition: ", planet.position);
            logger.Log("Slowest Planet Move time ", (summaryAverage).toFixed(3));
            logger.Log("Slowest Planet Update ", (planetUpdate).toFixed(3));
            logger.Log("Slowest Render Update ", (renderUpdate).toFixed(3));
            logger.Log("Slowest Update Update ", (updateUpdate).toFixed(3));
            logger.Log("Average render: ", (renderAverage/count).toFixed(6));
            logger.Log("Average planet ", (planetAverage/count).toFixed(6));
            logger.Log("Average position ", (updateAverage/count).toFixed(6));
            updateAverage = 0, planetAverage = 0, renderAverage = 0;
            count =0
            del = updateClock.getDelta();
            if (del > updateUpdate) {
                updateUpdate = del;
            }
        }


    }

    var summaryAverage = 0;

    function UpdateToLocal() {
        if (camera.position.length() > 1) {
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
//    setTimeout(function(){pause = !pause;}, 500);

    window.addEventListener("keypress", function (key) {
        if (key.key === "Spacebar") {
            pause = !pause;
            planet.Pause(pause);
            /*            if (!pause) {
             setTimeout(render, 100);
             } else {
             control.zoomSpeed = 1;
             }*/
        }

    });


};
window.addEventListener("load", main);


