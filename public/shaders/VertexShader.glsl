

uniform float Width;
uniform float Radius;
uniform vec3 StartPosition;
uniform vec3 HeightDir;
uniform vec3 WidthDir;


void main(){

    //Square
//    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width);

    //Sphere
    vec3 newPosition = vec3(normalize(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width) * Radius);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}