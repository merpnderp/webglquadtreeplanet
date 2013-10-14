/**
 * Created by kalebmurphy on 9/27/13.
 */


var express = require("express");
var app = express();

app.use(express.logger());
app.use(express.static(__dirname + '/public', {maxAge: 1}));

app.listen(3000);

