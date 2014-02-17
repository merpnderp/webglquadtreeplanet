watchify -v -t brfs -x ./libs/three.js -x ./libs/stats.js app/main.js -o ./app.js &
#watchify -v -t brfs -x ./libs/three.js app/PlanetWorker.js -o ./pw.js
watchify -v -t brfs app/PlanetWorker.js -o ./pw.js
