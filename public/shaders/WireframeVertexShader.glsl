uniform float width;
uniform vec3 center;

varying vec2 vUv;
varying float distRatio;

void main( void ) {
    vUv = uv;
    dist = distance(position, center) / width / 2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}