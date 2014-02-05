/**
 * Created by kalebmurphy on 2/1/14.
 */


var THREE = require('../libs/three.js');

//var workerObject = require('./worker.js');

var main = function () {

    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 7000000);
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('viewport').appendChild(renderer.domElement);

    var pause = false;

    var worker = new Worker('webworkertest/worker.js');

    var average = 0, attempts=0;

    worker.addEventListener('message', function(e) {
        console.log(e.data);
        var array = new Float64Array(e.data.typedArray.buffer);
        console.log('array length: ' + array.length);
        console.log("10th: " + array[10]);
        var time = new Date().getTime();
        average += (time - e.data.time);
        attempts++;
//        console.log( average + " : " + attempts);
        console.log("average time to pass: " + (average / attempts));
        worker.postMessage({msg: 'go'});
    }, false);

    worker.postMessage({msg: 'go'});

    function render() {


        if(!pause){
//            requestAnimationFrame(render);
        }else{
            setTimeout(render(),1);
        }

        renderer.render(scene, camera);

    }

    render();

    window.addEventListener("keypress", function (key) {
        if (key.key === "Spacebar") {
            pause = !pause;
        }

    });


};
window.addEventListener("load", main);