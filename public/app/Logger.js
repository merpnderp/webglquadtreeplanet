/**
 * Created by kalebmurphy on 10/18/13.
 */

"use strict";

var Logger = function(){

    //Singleton code
    if( typeof Logger.instance === 'object'){
        return Logger.instance;
    }




    Logger.instance = this;
};


Logger.prototype = {
    Add: function(){
        return this.test++;
    }
};


module.exports = Logger;
