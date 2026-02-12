import { Canvas } from "@react-three/fiber";
import { CANVAS, CAMERA, SCENE_ENV, LIGHTS } from "@/config/constants";
import { GameWorld } from "./GameWorld";

export function Scene() {
  return (
    <Canvas
      gl={{
        antialias: CANVAS.antialias,
        alpha: CANVAS.alpha,
        stencil: CANVAS.stencil,
        powerPreference: CANVAS.powerPreference,
      }}
      orthographic
      camera={{
        zoom: CAMERA.zoom,
        near: CAMERA.near,
        far: CAMERA.far,
        position: CAMERA.position,
        rotation: [Math.PI / 2, 0, 0],
      }}
      dpr={CANVAS.dpr}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <color attach="background" args={[SCENE_ENV.backgroundColor]} />
      <fog attach="fog" args={[SCENE_ENV.fog.color, SCENE_ENV.fog.near, SCENE_ENV.fog.far]} />
      <ambientLight intensity={LIGHTS.ambient.intensity} />
      <directionalLight
        position={LIGHTS.directional.main.position}
        intensity={LIGHTS.directional.main.intensity}
      />
      <GameWorld />
    </Canvas>
  );
}
