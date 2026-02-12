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

/** プレイヤーキャラクタ。WASD でタイル単位に移動。木箱を押して動かせる。向きは移動方向に追従。 */
export function Player({ position, rotationY }: { position: DisplayPosition; rotationY: number }) {
  const { col, row } = position;
  const [x, y, z] = gridToWorld(col, row);

  const width = 0.35;
  const depth = 0.5; // 前後方向に長めにして向きを視覚化

  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[width, PLAYER.height, depth]} />
        <meshBasicMaterial color={PLAYER.color} />
      </mesh>
      {/* 正面の目印（向きが一目で分かる） */}
      <mesh position={[0, 0, depth / 2 + 0.08]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#c4a574" />
      </mesh>
    </group>
  );
}
