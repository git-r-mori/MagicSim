import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayerMovement } from "./usePlayerMovement";
import { MAP, PLAYER } from "@/config/constants";

describe("usePlayerMovement", () => {
  it("初期位置は constants の PLAYER 配置", () => {
    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current).toEqual({
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    });
  });

  it("障害物タイルへは移動しない（D で東に進もうとして (4,3) がブロック）", () => {
    const obstacleAt4_3 = MAP.cratePositions.some((p) => p.col === 4 && p.row === 3);
    if (!obstacleAt4_3) {
      throw new Error("テスト前提: MAP.cratePositions に (4,3) が含まれていること");
    }

    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.col).toBe(3);
    expect(result.current.row).toBe(3);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD" }));
    });

    expect(result.current.col).toBe(3);
    expect(result.current.row).toBe(3);
  });

  it("空きタイルへは通常通り移動する", () => {
    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current).toEqual({ col: 3, row: 3 });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(result.current).toEqual({ col: 3, row: 2 });
  });
});
