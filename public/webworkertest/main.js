

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
var largestFeature = 80;
var persistence = 100;
worker.postMessage({largestFeature: largestFeature, persistence: persistence});

