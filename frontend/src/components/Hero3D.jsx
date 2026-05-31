import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import { useRef } from "react";

function FloatingShapes() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Center Crystal / Lotus shape placeholder */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[0, 0, 0]} castShadow>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial 
            color="#ef4f83" 
            metalness={0.1}
            roughness={0.2}
            transmission={0.8}
            thickness={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      {/* Orbiting particles/shapes */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[2, 1, -1]} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#f8b4c4" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[-2, -1, 1]} castShadow>
          <torusGeometry args={[0.4, 0.1, 16, 32]} />
          <meshStandardMaterial color="#ffc0cb" roughness={0.3} metalness={0.6} />
        </mesh>
      </Float>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        gl={{ preserveDrawingBuffer: true, powerPreference: "low-power" }}
      >
        <color attach="background" args={["#fef6f8"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ef4f83" />
        
        <PresentationControls 
          global 
          config={{ mass: 2, tension: 500 }} 
          snap={{ mass: 4, tension: 1500 }} 
          rotation={[0, 0.3, 0]} 
          polar={[-Math.PI / 3, Math.PI / 3]} 
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <FloatingShapes />
        </PresentationControls>

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
