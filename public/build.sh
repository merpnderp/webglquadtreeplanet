browserify -r ./libs/three.js > libs/libs.js 

watchify -v -d -t brfs -x ./libs/three.js app/main.js -o app/app.js
