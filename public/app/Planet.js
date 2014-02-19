/**
 * Created by kalebmurphy on 2/16/14.
 */

var THREE = require('../libs/three.js');
var fs = require('fs');

var Planet = function (options) {

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

    this.worker.onmessage = this.WorkerMessage.bind(this);

    this.meshes = {};
};

Planet.prototype = Object.create(THREE.Object3D.prototype);

Planet.prototype.WorkerMessage = function (event) {
    var me = this;
    if (event.data.deletedMeshes) {
        event.data.deletedMeshes.forEach(function (name) {
            me.scene.remove(me.meshes[name]);
            delete this.meshes[name];
        });
    }

    if (event.data.newMeshes) {
        event.data.newMeshes.forEach(function (mesh) {
            var buff = new THREE.BufferGeometry();
            buff.attributes.position = {};
            buff.attributes.position.array = mesh.positions;
            buff.attributes.position.itemSize = 3;
            buff.attributes.uv = {};
            buff.attributes.uv.array = mesh.uvs;
            buff.attributes.uv.itemSize = 2;

            var material = new THREE.ShaderMaterial({uniforms: {}, vertexShader: me.vertex, fragmentShader: me.frag, wireframe: true});
            var m = new THREE.Mesh(buff, material);
            m.position.x = mesh.center.x;
            m.position.y = mesh.center.y;
            m.position.z = mesh.center.z;
            me.scene.add(m);
            console.log(me.camera.position.x);
            console.log(me.camera.position.y);
            console.log(me.camera.position.z);
            console.log(mesh.center.x);
            console.log(mesh.center.y);
            console.log(mesh.center.z);
            var sphere = new THREE.SphereGeometry(me.radius/2);
            var s = new THREE.Mesh(sphere);
            var center = new THREE.Vector3(mesh.center.x, mesh.center.y, mesh.center.z);
//            center.add(this.position);
            s.position.set(center);
//            s.position.x = mesh.center.x;
//            s.position.y = mesh.center.y;
//            s.position.z = mesh.center.z;
            me.scene.add(s);
            console.log("Adding spheres");
//            buff.addAttribute('position', Float32Array, positions.size);
        });
    }

    console.log(Date.now() - event.data.started);
    console.log(event.data.finished);
    console.log(event.data);
}

Planet.prototype.Update = function () {
    var localCameraPosition;
    return function () {
        localCameraPosition = this.worldToLocal(this.camera.position.clone());
        this.worker.postMessage({Update: {localCameraPosition: localCameraPosition}});
    }
}();

module.exports = Planet;
