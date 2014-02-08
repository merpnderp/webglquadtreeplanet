/**
 * Created by kalebmurphy on 2/1/14.
 */
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

var start = 0;
var SimplexNoise_octave = require('./SimplexNoise.js');
var MathSeed = require('./MathSeedRandom');
var t = 0;


self.addEventListener('message', function (e) {
//    var buffer = new ArrayBuffer(8 * 1024 * 1024);
    start = new Date().getTime();
    var size = 512;
    var data = new Uint8Array(size * size * 4); // 64MB

    var simplex = new SimplexNoise(e.data.largestFeature, e.data.persistence, 1);

    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            var r = .5 * ((1+simplex.noise3D(x, y, t)) + 255);
            var g = .5 * ((1+simplex.noise3D(x, y, t)) + 255);
            data[(x + y * size) * 4 + 0] = r ;
            data[(x + y * size) * 4 + 1] = (r + g) ;
            data[(x + y * size) * 4 + 2] = 0;
            data[(x + y * size) * 4 + 3] = 255;
           /*
            data[(x + y * size) * 4 + 0] = r * 255;
            data[(x + y * size) * 4 + 1] = (r + g) * 200;
            data[(x + y * size) * 4 + 2] = 0;
            data[(x + y * size) * 4 + 3] = 255;
            */
        }
    }

    var struct = {time: new Date().getTime(),
        creation: (new Date().getTime() - start),
        typedArray: data};

    self.postMessage(struct, [struct.typedArray.buffer]);
    t++;

}, false);




