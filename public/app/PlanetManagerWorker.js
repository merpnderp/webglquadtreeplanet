/**
 * Created by kalebmurphy on 2/13/14.
 */



var PlanetManagerWorker = function(){


};



PlanetManagerWorker.prototype.Initialize = function(options){
};



PlanetManagerWorker.prototype.CreatePlanet = function(options){

};



var me = new PlanetManagerWorker();



self.addEventListener('message', function (e) {

    if(e.data.Initialize){
        me.Initialize(e.data.Initialize);
    }

    if(e.data.CreatePlanet){
        me.CreatePlanet(e.data.CreatePlanet);
    }

});

