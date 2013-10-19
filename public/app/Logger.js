/**
 * Created by kalebmurphy on 10/18/13.
 */

"use strict";

var THREE = require('../libs/three.js');

var Logger = function () {

    //Singleton code
    if (typeof Logger.instance === 'object') {
        return Logger.instance;
    }

    this.domElement = document.createElement('div');
    this.domElement.style.fontSize = "xx-small";

    this.updated = false;

    this.strings = {};

    Logger.instance = this;
};


Logger.prototype = {
    Log: function (text, value) {
        var valueText;

        if (value instanceof THREE.Vector3) {
            valueText = value.x + ", " + value.y + ", " + value.z;
        } else {
            valueText = value;
        }

        if (this.strings[text] !== valueText) {
            this.updated = true;
            this.strings[text] = valueText;
        }

        if (this.updated) {
            this.WriteLogs();
            this.updated = false;
        }
    },

    WriteLogs: function () {
        var text = '';
        for (var k in this.strings) {
            if (this.strings.hasOwnProperty(k)) {
                text += k + " : " + this.strings[k] + "<br />";
            }
        }
        this.domElement.innerHTML = text;
    }

};


module.exports = Logger;
