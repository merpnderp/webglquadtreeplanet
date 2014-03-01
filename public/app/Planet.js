/**
 * Created by kalebmurphy on 2/16/14.
 */

var THREE = require('../libs/three.js');
var fs = require('fs');

var Planet = function (options) {
	
    THREE.Object3D.call(this);
	
    this.isInitialized = false;
    this.pause = false;
    this.meshes = {};
    this.meshBuildTimeAvg = 0;
	
	this.loadShaders();
	
	this.depthTexture = THREE.ImageUtils.loadTexture("./earth_low.png", undefined, function () {
		console.log(arguments)
	});
	this.texture = THREE.ImageUtils.loadTexture("./earth.jpg");
	
	this.initializeOptions(options);
	
	this.initializeWorker();
	
	this.updateCounter = 0;
	this.avg = 0;

};



Planet.prototype = Object.create(THREE.Object3D.prototype);

Planet.prototype.initializeOptions = function (options, callback) {
	
	this.workerPath = options.workerPath || "./pw.js";
	
	this.configureCamera(options.camera);

    this.scene = options.scene;
    this.radius = options.radius;
    this.patchSize = options.patchSize;
    this.fov = options.fov;
	
};

Planet.prototype.configureCamera = function ( camera ) {
	
    this.camera = camera;
    this.cameraHeight = 0;
	
};

Planet.prototype.loadShaders = function () {

    this.vertex = fs.readFileSync('shaders/VertexShader.glsl');
    this.frag = fs.readFileSync('shaders/FragmentShader.glsl');
    this.wfvertex = fs.readFileSync('shaders/WireframeVertexShader.glsl');
    this.wffragment = fs.readFileSync('shaders/WireframeFragmentShader.glsl');
    this.planetVertex = fs.readFileSync('shaders/PlanetVertexShader.glsl');
    this.planetFragment = fs.readFileSync('shaders/PlanetFragmentShader.glsl');

};

Planet.prototype.initializeWorker = function () {

    this.worker = new Worker(this.workerPath);
    this.worker.onmessage = this.onWorkerMessage.bind(this);

    this.worker.postMessage({
		Init: {
			radius: this.radius,
			patchSize: this.patchSize,
			fov: this.fov,
			screenWidth: screen.width
		}
	});
	
};

Planet.prototype.update = function () {

    return function () {

		var localCameraPosition;
		
        if (!this.isInitialized) {
            return;
        }
		
        localCameraPosition = this.worldToLocal(this.camera.position.clone());
        this.cameraHeight = localCameraPosition.length() - this.radius;
        if (this.pause) {
            return;
        }
		
        this.worker.postMessage({
			update: {
				localCameraPosition: localCameraPosition,
				started: performance.now()
			}
		});
    }
}();



Planet.prototype.onWorkerMessage = function (event) {

    // var me = this;
	
	// Local reference so we don't have to scope traverse in the JIT compiler
	var data = event.data;

    if (data.isInitialized) {
        this.isInitialized = true;
        return;
    }
	
	// Is this akin to an Error?
    if (data.log) {
//        console.log(data.log);
        return;
    }

    if (data.deletedMeshes) {
        data.deletedMeshes.forEach(this.removeMesh.bind(this));
    }

    if (data.newMeshes) {
        if (data.newMeshes.length > 0) {

            this.updateCounters += 1;
            this.avg += (performance.now() - data.started);
			
            this.meshBuildTimeAvg = this.avg / (this.updateCounters);
			
            if ( this.updateCounters % 10 == 0 ) {
				
                this.avg = 0;
				this.updateCounters= 0;
				
            }
        }
		
        data.newMeshes.forEach(this.buildNewMesh.bind(this));
    }
    /*
     console.log(Date.now() - data.started);
     console.log(data.finished);
     console.log(data);
     */
};

/**
 * Remove a mesh from the scene and the planet.
 */
Planet.prototype.removeMesh = function (name) {

    this.scene.remove(this.meshes[name]);
    delete this.meshes[name];
    //console.log("Deleting: " + name);

};

Planet.prototype.buildNewMesh = function (mesh) {
    var buff = new THREE.BufferGeometry();
	
	
    buff.attributes.position = {};
    buff.attributes.position.array = mesh.positions;
    buff.attributes.position.itemSize = 3;
    /*
     buff.attributes.normal = {};
     buff.attributes.normal.array = mesh.normals;
     buff.attributes.normal.itemSize = 3;
     */
    buff.attributes.uv = {};
    buff.attributes.uv.array = mesh.uvs;
    buff.attributes.uv.itemSize = 2;

    buff.computeBoundingSphere();
	
	
    var color = new THREE.Color();
	
	var decimalColor = ((mesh.width/1E11) * 16777215);
	
	
    var R =	 decimalColor%256;
    var G =	 (decimalColor/256)%256;
    var B =	 ((decimalColor/256)/256)%256;
	
	
    color.r = R;
    color.g = G;
    color.b = B;
	
	// 
	// var pos = new THREE.Vector3(mesh.center.x, mesh.center.y, mesh.center.z).clone().sub(this.position);
	// 
	// var x = pos.x / this.radius;
	// var y = pos.y / this.radius;
	// var z = pos.z / this.radius;
	// 
	// var r = Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) + Math.pow( z, 2 ));
	// var phi = Math.acos( z / r )
	// var theta = Math.atan2( y, x );
	// 
	// var lat = phi * (180/Math.PI);
	// var lon = theta * (180/Math.PI);
	// 
	// console.log(lat, lon, mesh.width);
	// // var tile = THREE.ImageUtils.loadTexture("http://localhost:4040/imageProxy?lat=" + lat + "&lon=" + lon + "&depth=" + Math.ceil(Math.log(r)/Math.log(2)), undefined, function () {});
	// 
	// this.material = new THREE.ShaderMaterial({
	// 	uniforms: {
	//         depth: { // texture in slot 0, loaded with ImageUtils
	//             type: "t",
	//             value: this.depthTexture
	//         },
	// 		scale: {
	// 			type: "f",
	// 			value: this.radius
	// 		},
	// 		skin: {
	// 			type: "t",
	// 			value: this.texture
	// 		}
	//     },
	// 	vertexShader: this.planetVertex,
	// 	fragmentShader: this.planetFragment,
	// 	// wireframe: true
	// });
	// 
	// 
	
	this.material = new THREE.MeshBasicMaterial({wireframe: true, color: color});
	
	
    var m = new THREE.Mesh(buff, this.material);
	
    m.position.x = mesh.center.x;
    m.position.y = mesh.center.y;
    m.position.z = mesh.center.z;
    m.position.add(this.position);

    this.scene.add(m);
    this.meshes[mesh.name] = m;
	

}

module.exports = Planet;
