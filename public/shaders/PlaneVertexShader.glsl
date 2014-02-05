
precision highp float;

uniform float Width;
uniform float Radius;
uniform vec3 StartPosition;
uniform vec3 HeightDir;
uniform vec3 WidthDir;


void main(){

    vec3 nStart = normalize(StartPosition);
   // vec3 cHeightDir = cross(HeightDir, StartPosition);
    //vec3 cWidthDir = cross(WidthDir, StartPosition);
    vec3 cHeightDir = cross(nStart, HeightDir);
    vec3 cWidthDir = cross(nStart, WidthDir);


    //Sphere
    vec3 newPosition = StartPosition.xyz + (cWidthDir * (position.x - .5 ) + cHeightDir * (position.y - .5 )) * Width;

    //gl_Position = projectionMatrix * cpuModelViewMatrix * vec4( newPosition, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}