import * as THREE from "three";
import { Lightformer } from "@react-three/drei";
import { LayerMaterial, Color, Depth } from "lamina";

const Lightformers = () => {
  return (
    <>
      <Lightformer
        intensity={1.2}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
        color="#c4b5fd"
      />

      <Lightformer
        form="circle"
        color="#ddd6fe"
        intensity={3}
        rotation={[Math.PI / 2, 0, 0]}
        position={[2, 4, 0]}
        scale={[3, 1, 1]}
      />
      <Lightformer
        form="circle"
        color="#ddd6fe"
        intensity={2}
        rotation={[Math.PI / 2, 0, 0]}
        position={[-2, 4, 12]}
        scale={[3, 1, 1]}
      />
      <Lightformer
        form="circle"
        color="#c4b5fd"
        intensity={1.5}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 4, -20]}
        scale={[3, 1, 1]}
      />

      <Lightformer
        form="ring"
        color="#818cf8"
        intensity={2}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 2, -12]}
        scale={[5, 1, 1]}
      />
      <Lightformer
        form="ring"
        color="#a78bfa"
        intensity={4}
        scale={10}
        position={[-15, 4, -18]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="ring"
        color="#818cf8"
        intensity={3}
        scale={8}
        position={[14, -3, -14]}
        target={[0, 0, 0]}
      />

      <Lightformer
        color="#818cf8"
        intensity={5}
        rotation-y={Math.PI / 2}
        position={[-5, 1, -1]}
        scale={[20, 0.1, 1]}
      />
      <Lightformer
        color="#a78bfa"
        intensity={2}
        rotation-y={Math.PI / 2}
        position={[-5, -1, -1]}
        scale={[20, 0.5, 1]}
      />
      <Lightformer
        color="#c084fc"
        intensity={3}
        rotation-y={-Math.PI / 2}
        position={[10, 1, 0]}
        scale={[20, 1, 1]}
      />

      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <LayerMaterial side={THREE.BackSide}>
          <Color color="#05011a" alpha={1} mode="normal" />
          <Depth
            colorA="#6d28d9"
            colorB="#000"
            alpha={0.5}
            mode="normal"
            near={0}
            far={300}
            origin={[100, 100, 100]}
          />
        </LayerMaterial>
      </mesh>
    </>
  );
};

export default Lightformers;
