
precision highp float;

uniform float Width;
uniform float Radius;
uniform vec3 StartPosition;
uniform vec3 HeightDir;
uniform vec3 WidthDir;


void main(){

    //Square
//    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * (position.x) + HeightDir * (position.y)) * Width);

    //Sphere
    vec3 newPosition = vec3(normalize(StartPosition.xyz + (WidthDir * (position.x ) + HeightDir * (position.y )) * Width) * Radius);
    //vec3 newPosition = StartPosition.xyz + (WidthDir * (position.x ) + HeightDir * (position.y )) * Width;
    //newPosition =  newPosition / ( length(newPosition) / Radius );

    //gl_Position = projectionMatrix * cpuModelViewMatrix * vec4( newPosition, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}