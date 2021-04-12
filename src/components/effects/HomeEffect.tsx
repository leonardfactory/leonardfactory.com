import * as THREE from 'three';
import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useState } from 'react';
import { raymarchingFragment } from './raymarchingFragment';
import { raymarchingVertex } from './raymarchingVertex';
import { EffectComposer, SSAO } from '@react-three/postprocessing';
import useMousePosition from '../../common/three/hooks/useMousePosition';
import { useWindowSize } from '../../common/three/hooks/useWindowSize';

export interface IHomeEffectProps {}

function Box(props: JSX.IntrinsicElements['mesh']) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01));

  const uniforms = useRef({
    Resolution: { value: new THREE.Vector2(600.0, 250.0) },
    Mouse: { value: new THREE.Vector2(0.0, 0.0) },
    Screen: { value: new THREE.Vector2(1.0, 1.0) },
    Time: { value: 0 },
    // phong material uniforms
    Ka: { value: new THREE.Vector3(0.2, 0.2, 1.0) },
    Kd: { value: new THREE.Vector3(0.2, 0.2, 1.0) },
    Ks: { value: new THREE.Vector3(0.5, 0.2, 0.6) },
    LightIntensity: { value: new THREE.Vector4(0.9, 0.9, 0.9, 1.0) },
    LightPosition: { value: new THREE.Vector4(0.0, 7.0, 5.0, 1.0) },
    Shininess: { value: 0.3 },
  });

  const mousePosition = useMousePosition();
  const windowSize = useWindowSize();

  useFrame((_state, delta) => {
    uniforms.current.Time.value += delta;
    uniforms.current.Screen.value.set(windowSize.width ?? 100, 240);
    uniforms.current.Mouse.value.set(
      (mousePosition.x ?? 0) / (windowSize.width ?? 100),
      -(mousePosition.y ?? 0) / (windowSize.height ?? 100)
    );
    // console.log('mp', uniforms.current.Mouse.value.toArray());
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      // scale={hovered ? 1.5 : 1}
    >
      <planeGeometry attach="geometry" args={[windowSize.width, 240, 8]} />
      {/* <boxGeometry args={[1, 1, 1]} /> */}
      <shaderMaterial
        attach="material"
        uniforms={uniforms.current!}
        fragmentShader={raymarchingFragment}
        vertexShader={raymarchingVertex}
      />
      {/* <meshStandardMaterial color="hotpink" /> */}
    </mesh>
  );
}

export function HomeEffect(_props: IHomeEffectProps) {
  return (
    <Canvas gl={{ antialias: true, pixelRatio: window.devicePixelRatio * 1.5 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[8, 1, 0]} />
      {/* <Box position={[4, 1, 0]} /> */}
      <EffectComposer multisampling={0}>{/* <SSAO /> */}</EffectComposer>
    </Canvas>
  );
}
