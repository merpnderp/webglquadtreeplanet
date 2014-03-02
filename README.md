#webglquadtreeplanet

A WebGL/Three.js implementaiton of a quadtree planet.

##Table of Contents

* `build`			              - The build script for producing the packaged minified scripts.

* `demo/`			              - A number of example implementations of the Quad Tree Sphere
  * `shadedSphere/`               - A basic sphere with each level of depth shaded slightly off of the primary color.
  * `depthMapping/`               - An example of how to depth map quad tree sphere.
  * `proceduralLandscape/`        - A procedural landscape generated in real time.
	* `scripts/`			      - Scripts used by the demos including minified versions of the QuadTreeSphere library and its delegate worker.
	
* `src/`                          - The main source files for the project.
  * `worker/`                     - The worker and it's componants that perform the quadtree work.

* `bin/`                          - The output directory for the build script.


##Bulding Project

Builds depend on uglify-js to perform minification.

```

sudo npm -g install uglify-js

```

Once you have uglify-js installed simply run the build script.

```

./build

```

The build will generate a bin folder in which you will find minified files. The library and its delegate worker.

* `bin/`
	* `QuadSphere.min.js`          - The quad tree sphere.
	* `QuadSphereWorker.min.js`    - The worker delegate for the QuadSphere


## Running Project

Simply start a python simple http server

```

cd demo
python -m SimpleHTTPServer

```
