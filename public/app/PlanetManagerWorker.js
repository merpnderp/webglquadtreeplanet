/**
 * Created by kalebmurphy on 2/13/14.
 */


var Planet = require('./QuadTreeSphere.js');

var PlanetManagerWorker = function(){

    this.planets = [];

};



PlanetManagerWorker.prototype.Initialize = function(options){
};



PlanetManagerWorker.prototype.CreatePlanet = function(options){
    var planet = new Planet(options)
    planets.add(planet);
};

PlanetManagerWorker.prototype.UpdatePlanet = function(planet, cameraPosition){

};



var me = new PlanetManagerWorker();



self.addEventListener('message', function (e) {

    if(e.data.Initialize){
        return self.postMessage(me.Initialize(e.data.Initialize));
    }

    if(e.data.CreatePlanet){
        return self.postMessage(me.CreatePlanet(e.data.CreatePlanet));
    }

    if(e.data.GetPlanetUpdate){
        return self.postMessage(me.GetPlanetUpdate(e.data.GetPlanetUpdate));
    }


});

