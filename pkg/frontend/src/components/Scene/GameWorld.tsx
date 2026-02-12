import * as THREE from "three";
import { GRID, MAP } from "@/config/constants";
import { useFireMagic } from "@/hooks/useFireMagic";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
import { FireProjectile } from "./FireProjectile";
import { Player } from "./Player";

/** 木箱用の共有ジオメトリ（全箱同一サイズ） */
const CRATE_BOX = new THREE.BoxGeometry(MAP.crate.size, MAP.crate.height, MAP.crate.size);
const CRATE_EDGES = new THREE.EdgesGeometry(CRATE_BOX);

/** グリッド座標をワールド座標に変換（タイル中心・Y=0） */
function gridToWorld(col: number, row: number): [number, number, number] {
  const cx = (GRID.cols - 1) / 2;
  const cz = (GRID.rows - 1) / 2;
  const x = (col - cx) * GRID.tileSize;
  const z = (row - cz) * GRID.tileSize;
  return [x, 0, z];
}

/**
 * 8×8 草原風マップ。
 * タイルごとに色を少し変えて自然な草地表現にする。
 * 木箱オブジェクトは押して移動可能。侵入不可。
 * プレイヤー（WASD で移動）を配置。
 */
/** 燃焼進行度(0-1)からスケールを算出。終盤で急に小さくなる */
function burnScale(progress: number): number {
  const eased = 1 - (1 - progress) ** 2;
  return Math.max(0, 1 - eased);
}

/** 燃焼進行度から色を補間。木色→炎色(オレンジ)→焦げ色 */
function burnColor(progress: number): string {
  if (progress < 0.35) {
    const t = progress / 0.35;
    const r = Math.round(0x8b + (0xff - 0x8b) * t);
    const g = Math.round(0x69 + (0x66 - 0x69) * t);
    const b = Math.round(0x14 - 0x14 * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (progress - 0.35) / 0.65;
  const r = Math.round(0xff + (0x1a - 0xff) * t);
  const g = Math.round(0x66 + (0x0a - 0x66) * t);
  const b = Math.round(0x00);
  return `rgb(${r},${g},${b})`;
}

export function GameWorld() {
  const movement = usePlayerMovement();
  const { displayPosition, displayRotationY, displayCratePositions, displayBurningCrates } =
    movement;
  const { projectiles } = useFireMagic(() => ({
    position: movement.position,
    facing: movement.facing,
    cratePositions: movement.cratePositions,
  }));

  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      tiles.push({ col, row });
    }
  }

  return (
    <group>
      <Player position={displayPosition} rotationY={displayRotationY} />
      {projectiles.map((p) => (
        <FireProjectile key={p.id} state={p} />
      ))}
      {tiles.map(({ col, row }) => {
        const colorIndex = (row + col) % MAP.grasslandColors.length;
        const color = MAP.grasslandColors[colorIndex];
        const [x, , z] = gridToWorld(col, row);

        const size = GRID.tileSize - GRID.tileGap;
        return (
          <mesh key={`${col}-${row}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {displayCratePositions.map(({ col, row }, i) => {
        const [x, , z] = gridToWorld(col, row);
        const { bodyColor, edgeColor, height } = MAP.crate;
        return (
          <group key={`crate-${i}`} position={[x, height / 2, z]}>
            <mesh geometry={CRATE_BOX}>
              <meshBasicMaterial color={bodyColor} />
            </mesh>
            <lineSegments geometry={CRATE_EDGES}>
              <lineBasicMaterial color={edgeColor} />
            </lineSegments>
          </group>
        );
      })}
      {displayBurningCrates.map(({ col, row, progress }, i) => {
        const [x, , z] = gridToWorld(col, row);
        const { height } = MAP.crate;
        const scale = burnScale(progress);
        const color = burnColor(progress);
        return (
          <group
            key={`burning-${col}-${row}-${i}`}
            position={[x, height / 2, z]}
            scale={[scale, scale, scale]}
          >
            <mesh geometry={CRATE_BOX}>
              <meshBasicMaterial color={color} />
            </mesh>
            <lineSegments geometry={CRATE_EDGES}>
              <lineBasicMaterial color={MAP.crate.burnEdgeColor} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}
