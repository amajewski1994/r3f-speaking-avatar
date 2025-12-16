import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import { MathUtils } from "three";
import { visemesValues } from "../data/visemes";
import { useAvatar } from "../hooks/useAvatar";

const Avatar = (props) => {
  const group = useRef();

  const { scene } = useGLTF("/models/avatar.glb");

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

  const currentMessage = useAvatar((state) => state.currentMessage);
  const current = useAvatar((state) => state.avatarAnimation);
  const clearCurrentMessage = useAvatar((s) => s.clearCurrentMessage);

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

  const lerpMorphTarget = (value, speed = 0.1) => {
    scene.traverse((child) => {
      child.frustumCulled = false;
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        if (child.name === "Wolf3D_Head") {
          child.morphTargetInfluences[0] = MathUtils.lerp(
            child.morphTargetInfluences[0],
            value.mouthOpen,
            speed
          );
        }

        if (child.name === "Wolf3D_Teeth") {
          child.morphTargetInfluences[0] = MathUtils.lerp(
            child.morphTargetInfluences[0],
            value.teethOpen,
            speed
          );
        }
      }
    });
  };

  useFrame(() => {
    lerpMorphTarget(visemesValues[0], 0.05);

    if (currentMessage?.visemes?.length && currentMessage.startedAt != null) {
      const elapsedMs = performance.now() - currentMessage.startedAt;

      const endMs =
        currentMessage.visemes[currentMessage.visemes.length - 1][0] + 150;
      if (elapsedMs > endMs) {
        clearCurrentMessage();
        return;
      }

      for (let i = currentMessage.visemes.length - 1; i >= 0; i--) {
        const [ms, visemeId] = currentMessage.visemes[i];
        if (elapsedMs >= ms) {
          lerpMorphTarget(visemesValues[visemeId], 0.2);
          break;
        }
      }
    }
  });

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("/models/avatar.glb");

export default Avatar;
