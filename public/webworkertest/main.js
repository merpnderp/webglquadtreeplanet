
var MathSeed = require('./MathSeedRandom');
var SimplexNoise_octave = require('./SimplexNoise.js');

var SimplexNoise = function (largestFeature, persistence, seed) {
    this.octaves = [];

    this.largestFeature = largestFeature;
    this.persistence = persistence;
    this.seed = seed;

    //recieves a number (eg 128) and calculates what power of 2 it is (eg 2^7)
    var numberOfOctaves = Math.ceil(Math.log(largestFeature) / Math.log(2));

    this.octaves = [];
    this.frequencys = [];
    this.amplitudes = [];

    var mathSeed = new MathSeed(10);

    for (var i = 0; i < numberOfOctaves; i++) {
//        this.octaves[i] = new SimplexNoise_octave(mathSeed.seededRandom);
        this.octaves[i] = new SimplexNoise_octave(Math.random);

        this.frequencys[i] = Math.pow(2, i);
        this.amplitudes[i] = Math.pow(persistence, this.octaves.length - i);


    }
};

SimplexNoise.prototype.noise3D = function (x, y, z) {
    var result = 0;

    for (var i = 0; i < this.octaves.length; i++) {
        result = result + this.octaves[i].noise3D(x / this.frequencys[i], y / this.frequencys[i], z / this.frequencys[i]) * this.amplitudes[i];
    }


    return result;

};



/**
 * Created by kalebmurphy on 2/1/14.
 */

var pause = false;

window.addEventListener("keypress", function (key) {
    if (key.key === "Spacebar") {
        pause = !pause;
        if (!pause) {
            worker.postMessage({msg: 'go'});
        }
    }

});

var worker = new Worker('webworkertest/ww.js');

var average = 0, attempts = 0, creationTotal = 0, bestGen = 10000, worstGen = 0, bestReturn = 10000, worstReturn = 0;

var canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
    data = imgdata.data,
    t = 0, returnTime;

    var delta = new Date().getTime() - 2000;

worker.addEventListener('message', function (e) {
    var time = new Date().getTime();
    returnTime = time - e.data.time;

    if (t++ > 1) {


        if (returnTime < bestReturn) {
            bestReturn = returnTime;
        } else if (returnTime > worstReturn) {
            worstReturn = returnTime;
        }

        var creation = e.data.creation;

        if (creation < bestGen) {
            bestGen = creation;
        } else if (creation > worstGen) {
            worstGen = creation;
        }


        average += returnTime;
        creationTotal += creation;
        attempts++;

    }
    var array = new Uint8ClampedArray(e.data.typedArray.buffer);

    imgdata.data.set(array);

    ctx.putImageData(imgdata, 0, 0);

//        console.log( average + " : " + attempts);

    if (new Date().getTime() > delta + 1000) {
        updateLogs();
        delta = new Date().getTime();
    }

    if (!pause) {
        worker.postMessage({largestFeature: largestFeature, persistence: persistence});
    }
}, false);

function updateLogs() {
    document.getElementById('text').innerHTML = "" +
        "Largest Feature: " + largestFeature +"<br/>"+
        "Persistence: " + persistence +"<br/>"+
        "Octaves: " + Math.ceil(Math.log(largestFeature) / Math.log(2)) +"<br/>"+
        "Best Gen: " + bestGen + "<br/>" +
        "Worst Gen: " + worstGen + "<br/>" +
        "average time to build array: " + (creationTotal / attempts) + "<br/>" +
        "Best Return: " + bestReturn + "<br/>" +
        "Worst Return: " + worstReturn + "<br/>" +
        "average time to return from worker: " + (average / attempts) + "<br/>"+
        "time to return from worker: " + returnTime + "<br/>"+
    "SPACEBAR PAUSES"+ "<br/>";

}
var largestFeature = 100;
var persistence = 100;
worker.postMessage({largestFeature: largestFeature, persistence: persistence});
var max = -1000000, min = -max;

var simplex = new SimplexNoise(5, 10, 1);
/*
for(var x = 0; x<5; x++){
    for(var y = 0; y<5; y++){
        for(var z = 0; z<5; z++){
            var n = simplex.noise3D(x,y,z);
            if(n > max)max = n;
            if(n < min)min = n;
            console.log(n);
        }
    }
}
console.log("Max " + max);
console.log("Min " + min);
*/
