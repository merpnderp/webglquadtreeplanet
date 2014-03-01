/**
 * Created by kalebmurphy on 10/8/13.
 */

"use strict";

var THREE = require('../libs/three.js');
var OrbitControl = require('./OrbitControls');
//var Planet = require('./QuadTreeSphere.js');
var Planet = require('./Planet.js');
var Stats = require('../libs/stats.js');
var Logger = require('./Logger.js');
var FlyControl = require('./FlyControls');
var Application = require("./Application");


var demo = new Application({
	domElement: document.body,
	onInitialize: function () {

	    this.scene.add(this.planet);
		window.addEventListener("load", this.start.bind(this));
	
	},
	onStart: function () {
	    this.render();
	//    setTimeout(function(){pause = !pause;}, 500);

	    window.addEventListener("keypress", function (key) {
		
	        if (key.key === "Spacebar") {
			
	            this.pause = !this.pause;
	            this.planet.pause = this.pause;
	            /*            if (!pause) {
	             setTimeout(render, 100);
	             } else {
	             control.zoomSpeed = 1;
	             }*/
	        }

	    }.bind(this));
	},
	onError: function (error) {
		console.error(error);
	}
});

// Initialization stages run in a first in first out order
// this refers to the context of the Application instance

demo.addInitializationStage({
	name: "initialize-statistics",
	stage: function () {
	    this.stats = new Stats();

	    this.stats.setMode(0);
	    this.stats.domElement.style.position = 'absolute';
	    this.stats.domElement.style.top = '0px';
	    this.stats.domElement.style.zIndex = 100;

	    this.domElement.appendChild(this.stats.domElement);
	}
});

demo.addInitializationStage({
	name: "initialize-logger",
	stage: function () {
	    this.logger = new Logger();

	    this.logger.domElement.style.position = 'absolute';
	    this.logger.domElement.style.top = '100px';
	    this.logger.domElement.style.zIndex = 100;

	    this.domElement.appendChild(this.logger.domElement);
	}
});

demo.addInitializationStage({
	name: "append-member-properties",
	stage: function () {
	
	    //var planetRadius = 9.46e23; // 100,000 light years
	    //var planetRadius = 695500000; // sun sized
	    var planetRadius = 6376136; // earth sized
	    //var planetRadius = 1737000; // moon sized
	    //var planetRadius = 370; // 624 Hektor Asteroid
	    //var planetRadius = .1; // 4 inches
	
		this.planetRadius = planetRadius;
	    this.controlMaxSpeed = 1000000;
	
	    this.pause = false;

	    this.clock = new THREE.Clock();
	    this.clockTest = new THREE.Clock();
	    this.updateClock = new THREE.Clock();
	    this.delta;
	    this.origin = new THREE.Vector3();

	    this.planetupdate = 0;
		this.del = 0;
		this.renderupdate = 0;
		this.updateupdate = 0;
		this.count = 0;
	    this.renderAverage = 0;
		this.planetAverage = 0;
		this.updateAverage = 0;
	
		this.summaryAverage = 0;
	
	}
});

demo.addInitializationStage({
	name: "create-camera",
	stage: function () {

	    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 7000000);
	
	    this.camera.position.z = this.planetRadius * 4;
	    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	}
});


demo.addInitializationStage({
	name: "create-controls",
	stage: function () {


	    this.control = new FlyControl(this.camera);

	    this.control.movementSpeed = this.controlMaxSpeed;
	    this.control.domElement = document.body;
	    this.control.rollSpeed = Math.PI / 12;
	    this.control.autoForward = false;
	    this.control.dragToLook = false;

	
	}
});

demo.addInitializationStage({
	name: "create-three-enviornment",
	stage: function () {


	    this.scene = new THREE.Scene();

	    this.renderer = new THREE.WebGLRenderer();
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	//		renderer.setClearColor( 0xffffff, 1) 
	    document.getElementById('viewport').appendChild(this.renderer.domElement);

	}
});

demo.addInitializationStage({
	name: "create-planet",
	stage: function () {

	    this.planet = new Planet({
			camera: this.camera,
			radius: this.planetRadius,
			patchSize: 32,
			scene: this.scene,
			fov: 30
		});
	
	}
});



demo.addInitializationStage({
	name: "append-render-callback-to-application",
	stage: function () {
	
	    this.updateToLocal = function() {

	        if (this.camera.position.length() > 10000) {
	
	            this.origin = this.origin.subVectors(this.camera.position, this.origin);
	
	            this.scene.children.forEach(function (child) {
	                //console.log("Moving " + child.position.x + " : " + child.position.y + " : " + child.position.z);
	                child.position.sub(this.origin);
	                //console.log("To " + child.position.x + " : " + child.position.y + " : " + child.position.z);
	            }.bind(this));
	            //planet.position.sub(origin);
	            this.origin.x = 0;
	            this.origin.y = 0;
	            this.origin.z = 0;
	            this.camera.position.x = 0;
	            this.camera.position.y = 0;
	            this.camera.position.z = 0;
	
	        }

	    }

		this.render = function () {
		
	        this.count++;
	        this.updateClock.getDelta();
	        this.delta = this.clock.getDelta();

	        requestAnimationFrame(this.render);

	        this.control.update(this.delta);

	        this.clockTest.getDelta();
	        this.renderer.render(this.scene, this.camera);
	        this.del = this.clockTest.getDelta();
	        this.renderAverage += this.del;
	        if (this.del > this.renderupdate && this.count > 15) {
	            this.renderupdate = this.del;
	        }

	        this.planet.update();

	        this.del = this.clockTest.getDelta();
	        this.planetAverage += this.del;
	        if (this.del > this.planetupdate && this.count > 15) {
	            this.planetupdate = this.del;
	        }

	        this.control.movementSpeed = this.planet.cameraHeight * 2;

	        this.stats.update();

	        this.clockTest.getDelta();
	        this.updateToLocal();

	        this.del = this.clockTest.getDelta();
	        this.updateAverage += this.del;
		
	        if (this.del > this.summaryAverage && this.count > 15) {
	            this.summaryAverage = this.del;
	        }
	        if (this.count % 30 === 0) {
	            this.logger.Log("Geometries ", this.renderer.info.memory.geometries);
	            this.logger.Log("Textures ", this.renderer.info.memory.textures);
	            this.logger.Log("Calls ", this.renderer.info.render.calls);
	            this.logger.Log("Vertices ", this.renderer.info.render.vertices);
	            this.logger.Log("Deepest Level ", this.planet.deepestNode);
	            this.logger.Log("Total Nodes ", this.planet.totalNodes);
	            this.logger.Log("Total Leaf Nodes ", this.planet.leafNodes);
	            this.logger.Log("CameraHeight (meters) ", Math.round(this.planet.cameraHeight));
	            this.logger.Log("CameraHeight (miles) ", Math.round(this.planet.cameraHeight * 0.000621371));
	            this.logger.Log("CameraPosition: ", this.camera.position);
	            this.logger.Log("PlanetPosition: ", this.planet.position);
	            this.logger.Log("Slowest Planet Move time ", (this.summaryAverage).toFixed(3));
	            this.logger.Log("Slowest Planet update ", (this.planetupdate).toFixed(3));
	            this.logger.Log("Slowest Render update ", (this.renderupdate).toFixed(3));
	            this.logger.Log("Slowest update update ", (this.updateupdate).toFixed(3));
	            this.logger.Log("Average render: ", (this.renderAverage/this.count).toFixed(6));
	            this.logger.Log("Average planet ", this.planet.meshBuildTimeAvg.toFixed(6));
	            this.logger.Log("Average position ", (this.updateAverage/this.count).toFixed(6));
	            this.updateAverage = 0
				this.planetAverage = 0
				this.renderAverage = 0;
	            this.count =0
	            this.del = this.updateClock.getDelta();
	            if (this.del > this.updateupdate) {
	                this.updateupdate = this.del;
	            }
	        }

		}.bind(this);

	}
});


demo.initialize();




