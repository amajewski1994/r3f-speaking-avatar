import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import { MathUtils } from "three";
import { visemesValues } from "../data/visemes";
import { useAvatar } from "../hooks/useAvatar";

const BASE = import.meta.env.BASE_URL;

const AVATAR_GLB = `${BASE}models/avatar.glb`;
const TALKING0_FBX = `${BASE}animations/Talking0.fbx`;
const TALKING1_FBX = `${BASE}animations/Talking1.fbx`;
const IDLE_FBX = `${BASE}animations/Idle.fbx`;

const Avatar = (props) => {
  const group = useRef();
  const prevAnimation = useRef(null);

  const { scene } = useGLTF(AVATAR_GLB);

  const { animations: talking0 } = useFBX(TALKING0_FBX);
  const { animations: talking1 } = useFBX(TALKING1_FBX);
  const { animations: idle } = useFBX(IDLE_FBX);

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
  const stopSpeaking = useAvatar((s) => s.stopSpeaking);

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
    if (!actions || !current) return;

    const action = actions[current];
    if (!action) return;

    if (prevAnimation.current === current) {
      action.stop();
    }

    action.reset().fadeIn(0.2).play();
    prevAnimation.current = current;

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

    if (!currentMessage) return;

    if (
      currentMessage.visemes &&
      currentMessage.startedAt &&
      !currentMessage.audioPlayer
    ) {
      const elapsedMs = performance.now() - currentMessage.startedAt;
      const endMs =
        currentMessage.visemes[currentMessage.visemes.length - 1][0] + 150;

      if (elapsedMs > endMs) {
        stopSpeaking();
        return;
      }

      for (let i = currentMessage.visemes.length - 1; i >= 0; i--) {
        const [ms, visemeId] = currentMessage.visemes[i];
        if (elapsedMs >= ms) {
          lerpMorphTarget(visemesValues[visemeId], 0.2);
          break;
        }
      }
      return;
    }

    // AUDIO
    if (currentMessage.audioPlayer && currentMessage.visemes) {
      const tMs = currentMessage.audioPlayer.currentTime * 1000;

      for (let i = currentMessage.visemes.length - 1; i >= 0; i--) {
        const [ms, visemeId] = currentMessage.visemes[i];
        if (tMs >= ms) {
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

useGLTF.preload(AVATAR_GLB);

export default Avatar;
