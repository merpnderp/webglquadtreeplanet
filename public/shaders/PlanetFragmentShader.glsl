varying vec2 vUv;
uniform sampler2D skin;
uniform sampler2D depth;

void main() {

    vec4 color = texture2D( skin, vUv );

    gl_FragColor = vec4( color.rgb, 1.0 );

}