import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useMemo, useState } from "react";

const Teacher = (props) => {
  const group = useRef();

  const { scene } = useGLTF("/models/teacher.glb");

  const { animations: talking0 } = useFBX("/animations/Talking0.fbx");
  const { animations: talking1 } = useFBX("/animations/Talking1.fbx");
  const { animations: idle } = useFBX("/animations/Idle.fbx");

  const animations = useMemo(() => {
    const t0 = talking0[0].clone();
    t0.name = "Talking0";

    const t1 = talking1[0].clone();
    t1.name = "Talking1";

    const id = idle[0].clone();
    id.name = "Idle";

    return [t0, t1, id];
  }, [talking0, talking1, idle]);

  const { actions } = useAnimations(animations, group);

  const [animation, setAnimation] = useState("Idle");
  const current = animation;

  // shadows
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  // animations
  useEffect(() => {
    const action = actions?.[current];
    if (!action) return;

    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, current]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("/models/teacher.glb");

export default Teacher;
