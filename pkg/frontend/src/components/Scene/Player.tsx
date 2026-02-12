import { GRID, PLAYER } from "@/config/constants";
import type { DisplayPosition } from "@/hooks/usePlayerMovement";

/** グリッド座標をワールド座標に変換（タイル中心・小数対応でスライド補間） */
function gridToWorld(col: number, row: number): [number, number, number] {
  const cx = (GRID.cols - 1) / 2;
  const cz = (GRID.rows - 1) / 2;
  const x = (col - cx) * GRID.tileSize;
  const z = (row - cz) * GRID.tileSize;
  const y = PLAYER.height / 2; // タイル上面に乗る高さ
  return [x, y, z];
}

/** プレイヤーキャラクタ。WASD でタイル単位に移動。木箱を押して動かせる。 */
export function Player({ position }: { position: DisplayPosition }) {
  const { col, row } = position;
  const [x, y, z] = gridToWorld(col, row);

  const size = 0.4; // タイル内に収まるサイズ

  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[size, PLAYER.height, size]} />
      <meshBasicMaterial color={PLAYER.color} />
    </mesh>
  );
}
