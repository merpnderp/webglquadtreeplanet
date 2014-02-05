/**
 * Created by kalebmurphy on 2/1/14.
 */



self.addEventListener('message', function(e) {
    var buffer = new ArrayBuffer(8 * 1024 * 1024);
    var data = new Float64Array(buffer); // 64MB

    for(var i = 0; i < data.length; i++){
        data[i] = i * 2;
    }

    var struct = {time: new Date().getTime(),
    typedArray : data};

    self.postMessage(struct, [struct.typedArray.buffer]);

}, false);

