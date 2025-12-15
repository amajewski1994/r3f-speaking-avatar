import { useGLTF } from "@react-three/drei";

const Teacher = (props) => {
  const { scene } = useGLTF("/models/teacher.glb");

  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return <primitive object={scene} {...props} />;
};

useGLTF.preload("/models/teacher.glb");

export default Teacher;
