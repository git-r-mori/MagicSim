import { useState, useEffect, useCallback } from "react";
import { tryMoveWithPush, type GridDirection } from "@magicsim/core";
import { GRID, MAP, PLAYER } from "@/config/constants";
import { PLAYER_KEY_CODES } from "./usePlayerKeyboard";

const KEY_TO_DIRECTION: Record<string, GridDirection> = {
  [PLAYER.keys.w]: "n",
  [PLAYER.keys.s]: "s",
  [PLAYER.keys.a]: "w",
  [PLAYER.keys.d]: "e",
};

export interface PlayerPosition {
  col: number;
  row: number;
}

export interface CratePosition {
  col: number;
  row: number;
}

export interface PlayerMovementState {
  position: PlayerPosition;
  cratePositions: CratePosition[];
}

const INITIAL_CRATE_POSITIONS: CratePosition[] = MAP.cratePositions.map((p) => ({ ...p }));

/**
 * プレイヤー位置と木箱配置を管理。WASD でタイル単位に移動。
 * 木箱タイルに進入する場合、押せるならプレイヤーと箱を同時移動。
 */
export function usePlayerMovement(): PlayerMovementState {
  const [state, setState] = useState<PlayerMovementState>({
    position: {
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    },
    cratePositions: INITIAL_CRATE_POSITIONS,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat || !PLAYER_KEY_CODES.includes(e.code)) return;
    const direction = KEY_TO_DIRECTION[e.code];
    if (!direction) return;

    e.preventDefault();
    setState((prev) => {
      const result = tryMoveWithPush(
        prev.position,
        direction,
        prev.cratePositions,
        GRID.cols,
        GRID.rows
      );
      if (!result.success) return prev;
      return {
        position: result.newPlayerPos,
        cratePositions: result.newCratePositions,
      };
    });
  }, []);

  useEffect(() => {
    const capture = true;
    window.addEventListener("keydown", handleKeyDown, capture);
    return () => window.removeEventListener("keydown", handleKeyDown, capture);
  }, [handleKeyDown]);

  return state;
}
