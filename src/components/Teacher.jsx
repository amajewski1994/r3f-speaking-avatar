import { useGLTF } from "@react-three/drei";

const Teacher = (props) => {
  const { scene } = useGLTF("/models/teacher.glb");
  return <primitive object={scene} {...props} />;
};

useGLTF.preload("/models/teacher.glb");

export default Teacher;
