# WebGL Quad Tree Sphere

A WebGL/Three.js implementaiton of a quadtree planet.

##Repository Contents

* `build`			              - The build script for producing the packaged minified scripts.

* `demo/`			              - A number of example implementations of the Quad Tree Sphere
  * `scripts/`			          - Scripts used by the demos including minified versions of the QuadTreeSphere library and its delegate worker.
  * `shadedSphere.html`           - A basic sphere with each level of depth shaded slightly off of the primary color.
  * `depthMapping.html`           - (SOON) An example of how to depth map quad tree sphere.
  * `proceduralLandscape.html`    - (SOON) A procedural landscape generated in real time.
	
* `src/`                          - The main source files for the project.
  * `worker/`                     - The worker and it's componants that perform the quadtree work.

* `bin/`                          - The output directory for the build script.


##Bulding Project


##### Build Script Dependencies

Builds depend on uglify-js to perform minification.

```

sudo npm -g install uglify-js

```

##### Build Script

Once you have uglify-js installed simply run the build script.

```

./build

```

The build will generate a bin folder in which you will find minified files. The library and its delegate worker.

* `bin/`
	* `QuadSphere.min.js`          - The quad tree sphere.
	* `QuadSphereWorker.min.js`    - The worker delegate for the QuadSphere


##### Build Cleanup

To clean the builds from the working directory run

```

./build clean

```

## Running Demos

Simply start a python simple http server

```

cd demo
python -m SimpleHTTPServer

```

![QuadSphere](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/quad-sphere.png)
![DisplacementTest](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/displacement-test.png)
![HorizonTest](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/horizon-test.png)
