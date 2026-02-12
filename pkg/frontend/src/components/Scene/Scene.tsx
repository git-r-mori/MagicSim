import { useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { CANVAS, CAMERA, SCENE_ENV, LIGHTS } from "@/config/constants";
import { dispatchFireRequest } from "@/hooks/useFireMagic";
import { GameWorld } from "./GameWorld";

/** 見下ろしカメラを (0,0,0) に向ける */
function CameraController() {
  return (
    <OrthographicCamera
      makeDefault
      position={CAMERA.position}
      zoom={CAMERA.zoom}
      near={CAMERA.near}
      far={CAMERA.far}
      onUpdate={(c) => c.lookAt(0, 0, 0)}
    />
  );
}

export function Scene() {
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      dispatchFireRequest();
    }
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        minWidth: "100%",
        minHeight: "100%",
      }}
    >
      <Canvas
        gl={{
          antialias: CANVAS.antialias,
          alpha: CANVAS.alpha,
          stencil: CANVAS.stencil,
          powerPreference: CANVAS.powerPreference,
        }}
        orthographic
        dpr={1}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <CameraController />
        <color attach="background" args={[SCENE_ENV.backgroundColor]} />
        <fog attach="fog" args={[SCENE_ENV.fog.color, SCENE_ENV.fog.near, SCENE_ENV.fog.far]} />
        <ambientLight intensity={LIGHTS.ambient.intensity} />
        <directionalLight
          position={LIGHTS.directional.main.position}
          intensity={LIGHTS.directional.main.intensity}
        />
        <GameWorld />
      </Canvas>
    </div>
  );
}
