/**
 * Created by kalebmurphy on 10/8/13.
 */

var $ = require('../libs/jquery.js');
var THREE = require('../libs/three.js');
var Planet = require('./QuadTreeSphere.js');
var fs = require('fs');

var text = fs.readFileSync('index.html');

console.log(THREE);
