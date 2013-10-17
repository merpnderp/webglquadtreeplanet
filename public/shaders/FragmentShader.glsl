uniform vec3 iColor;

void main() {

    gl_FragColor = vec4( iColor.xyz, 1.0 );
//    gl_FragColor = vec4( 1.0,1.0,.5, 1.0 );

}