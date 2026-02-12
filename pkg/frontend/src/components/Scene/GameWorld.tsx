import * as THREE from "three";
import { GRID, MAP } from "@/config/constants";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
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
export function GameWorld() {
  const { displayPosition, displayRotationY, displayCratePositions } = usePlayerMovement();

  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      tiles.push({ col, row });
    }
  }

  return (
    <group>
      <Player position={displayPosition} rotationY={displayRotationY} />
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
    </group>
  );
}
