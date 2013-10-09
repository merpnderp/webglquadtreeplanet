browserify -r ./libs/jquery.js -r ./libs/three.js > libs/libs.js 

watchify -v -t brfs -x ./libs/three.js -x ./libs/jquery.js app/main.js -o app/app.js
