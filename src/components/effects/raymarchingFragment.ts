import { glsl } from '../../common/three/glsl';

export const raymarchingFragment = glsl`
varying vec3 vPos;

uniform vec2 Resolution;
uniform vec2 Mouse;
uniform vec2 Screen;
uniform float Time;

uniform vec3 Ka;
uniform vec3 Kd;
uniform vec3 Ks;
uniform vec4 LightPosition;
uniform vec3 LightIntensity;
uniform float Shininess;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
const float PI = 3.14159265359;
const float DEG_TO_RAD = PI / 180.0;

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotateAxis(vec3 pos, vec3 axis, float angle) {
  return mix(dot(axis, pos) * axis, pos, cos(angle)) + cross(axis, pos) * sin(angle);
}

float sdSphere(vec3 pos, vec3 off, float r) {
  return length(pos - off) - r;
}

float sdBox(vec3 pos, vec3 off, vec3 box) {
  vec3 q = abs(pos - off) - box;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2-d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h); 
}

vec3 rotateVector(mat4 mat, vec3 pos) {
  return (mat * vec4(pos, 1.0)).xyz;
}

float sdScene(vec3 pos) {  
  float d1 = sdSphere(pos, vec3(Mouse.xy * 8.0, -2.0), 3.0);

  mat4 rot = rotationMatrix(vec3(1.0, 0.0, 2.0), Time);
  vec3 off = rotateVector(rot, vec3(2.5, 2.5, 0.0));
  float d2 = sdSphere(pos, off, 1.5);

  mat4 rot3 = rotationMatrix(vec3(1.0, 1.0, 0.0), radians(45.0));
  float d3 = sdBox(rotateVector(rot3, pos), vec3(1., 0., 0.), vec3(2.0, 2.6, 1.0));
    
  return sdSmoothUnion(sdSmoothUnion(d1, d2, 0.7), d3, 0.7);
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 pos) {
  return normalize(vec3(
    sdScene(vec3(pos.x + EPSILON, pos.y, pos.z)) - sdScene(vec3(pos.x - EPSILON, pos.y, pos.z)),
    sdScene(vec3(pos.x, pos.y + EPSILON, pos.z)) - sdScene(vec3(pos.x, pos.y - EPSILON, pos.z)),
    sdScene(vec3(pos.x, pos.y, pos.z  + EPSILON)) - sdScene(vec3(pos.x, pos.y, pos.z - EPSILON))
  ));
}

float shortestDistanceToSurface(vec3 eye, vec3 dir, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
      float dist = sdScene(eye + depth * dir);
      if (dist < EPSILON) {
			  return depth; 
      }
      
      depth += dist;
      if (depth >= end) {
          return end;
      }
    }
    return end;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.0;
  float z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(xy, -z));
}

vec3 phongLight(vec3 eye, vec3 pos) {
  vec3 n = estimateNormal(pos);
  vec3 s = normalize(vec3(LightPosition) - pos);
  vec3 v = normalize(eye - pos);
  vec3 r = normalize(reflect(-s, n));

  vec3 ambient = Ka;
  vec3 diffuse = Kd * max(dot(s, n), 0.0);
  vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

  return LightIntensity * (ambient + diffuse + specular);
}

mat3 rotationXY( vec2 angle ) {
	vec2 c = cos( angle );
	vec2 s = sin( angle );
	
	return mat3(
		c.y      ,  0.0, -s.y,
		s.y * s.x,  c.x,  c.y * s.x,
		s.y * c.x, -s.x,  c.y * c.x
	);
}

/**
 * Main rendering
 */
void main()
{
	vec3 dir = rayDirection(45.0, Screen.xy, gl_FragCoord.xy);
  vec3 eye = vec3(0.0, 0.0, 20.0);
  float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);

  // Rotate camera
  
  if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  
  // The closest point on the surface to the eyepoint along the view ray
  vec3 pos = eye + dist * dir;

  vec3 color = phongLight(eye, pos);
  gl_FragColor = vec4(color, 1.0);
}
`;
