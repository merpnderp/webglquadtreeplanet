varying vec2 vUv;
uniform sampler2D skin;
uniform sampler2D depth;
uniform float scale;

void main() {

    vUv = uv;
	vec4 dv = texture2D(depth, uv.xy);
	float df = (dv.x + dv.y + dv.z)/2.;// / (scale * 200.0);

    gl_Position = projectionMatrix * modelViewMatrix * (vec4( normalize(position) * df * 1.0, 1.0) + vec4 (position * 2.0, 1.0));

}
