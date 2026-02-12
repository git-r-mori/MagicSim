import { useState, useEffect, useCallback, useRef } from "react";
import { getFireProjectileEndPosition, type GridDirection } from "@magicsim/core";
import { GRID, FIRE_MAGIC } from "@/config/constants";
import { CRATE_DESTROYED_EVENT, MAP_RESET_EVENT } from "./usePlayerMovement";

const FIRE_REQUEST_EVENT = "magicsim:fire-request";

/** 炎弾の発射リクエストを発火（左クリック時などに呼ぶ） */
export function dispatchFireRequest(): void {
  window.dispatchEvent(new CustomEvent(FIRE_REQUEST_EVENT));
}

export interface FireProjectileState {
  id: string;
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
  /** 木箱に当たった場合、焼失対象の座標 */
  hitCrate: { col: number; row: number } | null;
  createdAt: number;
}

/** easeOutCubic: 終端で自然に減速 */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** 炎弾の表示位置を補間（0〜1） */
export function getProjectileDisplayPosition(
  state: FireProjectileState,
  progress: number
): { col: number; row: number } {
  const eased = easeOutCubic(Math.min(1, progress));
  return {
    col: state.startCol + (state.endCol - state.startCol) * eased,
    row: state.startRow + (state.endRow - state.startRow) * eased,
  };
}

export interface FireMagicState {
  position: { col: number; row: number };
  facing: GridDirection;
  cratePositions: readonly { col: number; row: number }[];
}

/**
 * 左クリックで炎魔法を前方に発射。
 * プレイヤーの位置・向き・木箱配置を getState で取得し、発射リクエスト時に弾を生成する。
 */
export function useFireMagic(getState: () => FireMagicState) {
  const [projectiles, setProjectiles] = useState<FireProjectileState[]>([]);
  const [, setTick] = useState(0);
  const projectilesRef = useRef<FireProjectileState[]>([]);
  projectilesRef.current = projectiles;
  const idCounterRef = useRef(0);
  const getStateRef = useRef(getState);
  getStateRef.current = getState;

  const handleFireRequest = useCallback(() => {
    const { position, facing, cratePositions } = getStateRef.current();
    const { end, hitCrate } = getFireProjectileEndPosition(
      position,
      facing,
      cratePositions,
      GRID.cols,
      GRID.rows,
      FIRE_MAGIC.maxTiles
    );
    if (end.col === position.col && end.row === position.row) return;

    idCounterRef.current += 1;
    const id = `fire-${idCounterRef.current}-${Date.now()}`;
    const createdAt = performance.now();
    setProjectiles((prev) => [
      ...prev,
      {
        id,
        startCol: position.col,
        startRow: position.row,
        endCol: end.col,
        endRow: end.row,
        hitCrate: hitCrate ? { col: hitCrate.col, row: hitCrate.row } : null,
        createdAt,
      },
    ]);
  }, []);

  useEffect(() => {
    window.addEventListener(FIRE_REQUEST_EVENT, handleFireRequest);
    return () => window.removeEventListener(FIRE_REQUEST_EVENT, handleFireRequest);
  }, [handleFireRequest]);

  const handleMapReset = useCallback(() => {
    setProjectiles([]);
  }, []);

  useEffect(() => {
    window.addEventListener(MAP_RESET_EVENT, handleMapReset);
    return () => window.removeEventListener(MAP_RESET_EVENT, handleMapReset);
  }, [handleMapReset]);

  useEffect(() => {
    if (projectiles.length === 0) return;
    let raf: number;
    const tick = () => {
      const now = performance.now();
      const current = projectilesRef.current;
      const toRemove = current.filter((p) => now - p.createdAt >= FIRE_MAGIC.durationMs);
      if (toRemove.length > 0) {
        toRemove.forEach((p) => {
          if (p.hitCrate) {
            window.dispatchEvent(
              new CustomEvent(CRATE_DESTROYED_EVENT, {
                detail: { col: p.hitCrate.col, row: p.hitCrate.row },
              })
            );
          }
        });
        setProjectiles((prev) => prev.filter((p) => !toRemove.some((r) => r.id === p.id)));
      } else {
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [projectiles.length]);

  return { projectiles };
}
