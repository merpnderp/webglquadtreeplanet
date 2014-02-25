
varying vec2 vUv;
varying vec3 vPosition;
varying vec4 wPosition;


void main() {


    float alpha = 0.15;

    float xPos = wPosition.x / 0.1;
//    float zPos = wPosition.z / 1.0;
    float yPos = wPosition.y / 0.1;

    float lowVal = 0.1;
    float highVal = 0.9;

    if( fract(xPos) < lowVal || fract(xPos) > highVal ||
 //       fract(zPos) < lowVal || fract(zPos) > highVal ||
        fract(yPos) < lowVal || fract(yPos) > highVal) {
        alpha = 1.0;
        gl_FragColor = vec4(0.5, 0.5, 0.5, alpha);
    }else {
        gl_FragColor = vec4(0.5, 0.5, 0.5, alpha);
    }
}