/**
 * Created by kalebmurphy on 2/16/14.
 */

var THREE = require('../libs/three.js');
var fs = require('fs');

var Planet = function(options){

    THREE.Object3D.call(this);

    this.vertex = fs.readFileSync('shaders/VertexShader.glsl');
    this.frag = fs.readFileSync('shaders/FragmentShader.glsl');

    this.camera = options.camera;
    this.scene = options.scene;
    this.radius = options.radius;
    this.patchSize = options.patchSize;
    this.fov = options.fov;
    this.worker = new Worker('./pw.js');
    this.worker.postMessage({Init: {radius: this.radius, patchSize: this.patchSize, fov: this.fov, screenWidth: screen.width}});

    this.worker.onmessage = this.WorkerMessage;
};

Planet.prototype = Object.create(THREE.Object3D.prototype);

Planet.prototype.WorkerMessage = function(event){
    console.log(Date.now() - event.data.started);
    console.log(event.data.finished);
    console.log(event.data);
}

Planet.prototype.Update = function(){
    var localCameraPosition;
    return function(){
        localCameraPosition = this.worldToLocal(this.camera.position.clone());
        this.worker.postMessage({Update: {localCameraPosition: localCameraPosition}});
    }
}();

module.exports = Planet;
