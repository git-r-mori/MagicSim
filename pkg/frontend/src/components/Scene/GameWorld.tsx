import * as THREE from "three";
import { GRID, MAP } from "@/config/constants";

/**
 * 8×8 草原風マップ。
 * タイルごとに色を少し変えて自然な草地表現にする。
 * MeshBasicMaterial で照明不要・確実に可視。
 */
export function GameWorld() {
  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      tiles.push({ col, row });
    }
  }

  const cx = (GRID.cols - 1) / 2;
  const cz = (GRID.rows - 1) / 2;

  return (
    <group>
      {tiles.map(({ col, row }) => {
        const colorIndex = (row + col) % MAP.grasslandColors.length;
        const color = MAP.grasslandColors[colorIndex];
        const x = (col - cx) * GRID.tileSize;
        const z = (row - cz) * GRID.tileSize;

        const size = GRID.tileSize - GRID.tileGap;
        return (
          <mesh key={`${col}-${row}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}
