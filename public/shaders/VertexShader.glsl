
precision highp float;

uniform float Width;
uniform float Radius;
uniform vec3 StartPosition;
uniform vec3 HeightDir;
uniform vec3 WidthDir;
uniform mat4 cpuModelViewMatrix;

uniform float arcLength;

vec3 rotateVector( vec4 quat, vec3 vec ){
  return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

vec4 createQuaternionFromAxisAngle( vec3 axis, float angle ) {

  vec4 quat;

  float halfAngle = angle / 2.0;
  float s = sin( halfAngle );

  quat.x = axis.x * s;
  quat.y = axis.y * s;
  quat.z = axis.z * s;
  quat.w = cos( halfAngle );

  return quat;

}


void main(){

//    vec4 wQuat = createQuaternionFromAxisAngle(HeightDir, arcLength * (position.x - .5));
//    vec4 hQuat = createQuaternionFromAxisAngle(WidthDir,  arcLength * (position.y - .5));
//    vec3 newPosition = rotateVector(wQuat, StartPosition);
//    newPosition = rotateVector(hQuat, newPosition);

    //Square
    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width);

    //Sphere
//    vec3 newPosition = vec3(normalize(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width) * Radius);
//    vec3 newPosition = vec3(StartPosition.xyz + (WidthDir * position.x + HeightDir * position.y) * Width);
//    vec3 diffPosition = newPosition - (normalize(newPosition) * Radius);
//    newPosition = newPosition - diffPosition;


    gl_Position = projectionMatrix * cpuModelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}