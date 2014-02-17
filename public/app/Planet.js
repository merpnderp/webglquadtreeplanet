/**
 * Created by kalebmurphy on 2/16/14.
 */

var THREE = require('../lib/three.js');

var Planet = function(options){

    this.vertex = fs.readFileSync('shaders/VertexShader.glsl');
    this.frag = fs.readFileSync('shaders/FragmentShader.glsl');

    this.radius = options.radius;
    this.patchSize = options.patchSize;
    this.fov = options.fov;
    this.worker = new Worker('./PlanetWorker.js');
    this.worker.Init({Init: {radius: this.radius, patchSize: this.patchSize, fov: this.fov, screenWidth: screen.width}});
};

Planet.prototype.Update = function(){
    var localCameraPosition = 1;
    this.worker.postMessage({Update: {localCameraPosition: localCameraPosition}});

};
