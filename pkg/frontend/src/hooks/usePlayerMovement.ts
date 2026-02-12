import { useState, useEffect, useCallback } from "react";
import { moveGridPosition, type GridDirection } from "@magicsim/core";
import { GRID, PLAYER } from "@/config/constants";
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

/**
 * プレイヤー位置を管理。WASD キー押下（リピートなし）でタイル単位に移動。
 */
export function usePlayerMovement(): PlayerPosition {
  const [position, setPosition] = useState<PlayerPosition>({
    col: PLAYER.initialCol,
    row: PLAYER.initialRow,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat || !PLAYER_KEY_CODES.includes(e.code)) return;
    const direction = KEY_TO_DIRECTION[e.code];
    if (!direction) return;

    e.preventDefault();
    setPosition((prev) => moveGridPosition(prev, direction, GRID.cols, GRID.rows));
  }, []);

  useEffect(() => {
    const capture = true;
    window.addEventListener("keydown", handleKeyDown, capture);
    return () => window.removeEventListener("keydown", handleKeyDown, capture);
  }, [handleKeyDown]);

  return position;
}
