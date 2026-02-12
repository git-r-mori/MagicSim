import { GRID, FIRE_MAGIC } from "@/config/constants";
import { getProjectileDisplayPosition, type FireProjectileState } from "@/hooks/useFireMagic";

/** グリッド座標をワールド座標に変換（タイル中心・Y=プレイヤー高さ付近） */
function gridToWorld(col: number, row: number): [number, number, number] {
  const cx = (GRID.cols - 1) / 2;
  const cz = (GRID.rows - 1) / 2;
  const x = (col - cx) * GRID.tileSize;
  const z = (row - cz) * GRID.tileSize;
  const y = 0.4;
  return [x, y, z];
}

/** 炎弾を表示。発射位置から着弾位置へスライドアニメーションする。 */
export function FireProjectile({ state }: { state: FireProjectileState }) {
  const progress = (performance.now() - state.createdAt) / FIRE_MAGIC.durationMs;
  const { col, row } = getProjectileDisplayPosition(state, progress);
  const [x, y, z] = gridToWorld(col, row);

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[FIRE_MAGIC.radius, 12, 8]} />
      <meshBasicMaterial color={FIRE_MAGIC.color} />
    </mesh>
  );
}
