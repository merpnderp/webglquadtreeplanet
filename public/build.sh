browserify -r ./libs/three.js > ./libs.js 

watchify -v -t brfs -x ./libs/three.js app/main.js -o ./app.js
