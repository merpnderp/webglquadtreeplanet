browserify -r ./libs/three.js -r ./libs/stats.js > ./libs.js;
browserify -v -t brfs -x ./libs/three.js -x ./libs/stats.js app/main.js -o ./app.js;
