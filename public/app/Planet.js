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
    this.cameraHeight = 0;
    this.scene = options.scene;
    this.radius = options.radius;
    this.patchSize = options.patchSize;
    this.fov = options.fov;
    this.worker = new Worker('./pw.js');
    this.worker.onmessage = this.WorkerMessage.bind(this);

    this.worker.postMessage({Init: {radius: this.radius, patchSize: this.patchSize, fov: this.fov, screenWidth: screen.width}});
    this.inited = false;
    this.meshes = {};
};

Planet.prototype = Object.create(THREE.Object3D.prototype);

Planet.prototype.Update = function () {
    var localCameraPosition;
    return function () {
        if (!this.inited) {
            return;
        }
        localCameraPosition = this.worldToLocal(this.camera.position.clone());
        this.cameraHeight = localCameraPosition.length() - this.radius;
        this.worker.postMessage({Update: {localCameraPosition: localCameraPosition}});
    }
}();

Planet.prototype.WorkerMessage = function () {
    return function (event) {

        var me = this;

        if (event.data.inited) {
            this.inited = true;
            return;
        }
        if (event.data.log) {
//        console.log(event.data.log);
            return;
        }

        if (event.data.deletedMeshes) {
            event.data.deletedMeshes.forEach(function (name) {
                me.scene.remove(me.meshes[name]);
                delete me.meshes[name];
                //console.log("Deleting: " + name);
            });
        }

        if (event.data.newMeshes) {
            event.data.newMeshes.forEach(function (mesh) {
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

                //var material = new THREE.ShaderMaterial({uniforms: {}, vertexShader: me.vertex, fragmentShader: me.frag, wireframe: true});
                var color = new THREE.Color();
                color.r = Math.random();
                color.g = Math.random();
                color.b = Math.random();
                var material = new THREE.MeshBasicMaterial({wireframe: true, color: color});
                var m = new THREE.Mesh(buff, material);
                m.position.x = mesh.center.x;
                m.position.y = mesh.center.y;
                m.position.z = mesh.center.z;
                m.position.add(me.position);
                me.scene.add(m);
                me.meshes[mesh.name] = m;
            });
        }
        /*
         console.log(Date.now() - event.data.started);
         console.log(event.data.finished);
         console.log(event.data);
         */
    }
}();


module.exports = Planet;
