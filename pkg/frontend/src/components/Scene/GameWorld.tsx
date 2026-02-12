import { GRID } from "@/config/constants";

/**
 * 2.5D グリッドステージのプレースホルダー。
 * プロトタイプ実装でグリッド・タイル・プレイヤーを追加する。
 */
export function GameWorld() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[GRID.cols * GRID.tileSize, GRID.rows * GRID.tileSize]} />
      <meshStandardMaterial color="#1a1a22" />
    </mesh>
  );
}
