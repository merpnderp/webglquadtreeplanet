//
// Supply a material to a quadrant.
// To implement your configuration requires a getMaterialForQuad callback method.
//
var QuadMaterial = function (config) {
	this.config = config;
	try {
		this.config.onCreate();
	}
	catch (e) {
		console.error("QuadMaterial onCreate had an error.", e);
	}
};

QuadMaterial.prototype = {
	
	/**
	 * Vector3 position - The center point of the quad
	 * float radius - Radius of the planet which hosts the quad
	 */
	getMaterialForQuad: function (centerPoint, position, radius, width) {
		try {
			return this.config.getMaterialForQuad(centerPoint, position, radius, width);
		}
		catch (e) {
			console.error("Unable to build quad material.", e);
			
			var color = new THREE.Color();
			color.r = color.g = color.b = 255;

			return new THREE.MeshBasicMaterial({wireframe: true, color: color});
			
		}
		
	}
	
};


module.exports = QuadMaterial;