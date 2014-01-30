
precision highp float;

uniform float Width;
uniform float Radius;
uniform vec3 StartPosition;
uniform vec3 HeightDir;
uniform vec3 WidthDir;
uniform mat4 cpuModelViewMatrix;


void main(){

    //Square
//    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width);

    //Sphere
    vec3 newPosition = vec3(normalize(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width) * Radius);
//    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width);
//    vec3 diffPosition = newPosition - (normalize(newPosition) * Radius);
//    newPosition = newPosition - diffPosition;


    gl_Position = projectionMatrix * cpuModelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}