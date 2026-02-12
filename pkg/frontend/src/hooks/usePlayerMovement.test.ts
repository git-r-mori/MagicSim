import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayerMovement } from "./usePlayerMovement";
import { MAP, PLAYER } from "@/config/constants";

describe("usePlayerMovement", () => {
  it("初期位置は constants の PLAYER 配置", () => {
    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.position).toEqual({
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    });
    expect(result.current.facing).toBe(PLAYER.initialFacing);
    expect(result.current.cratePositions).toHaveLength(MAP.cratePositions.length);
  });

  it("木箱を押せる（D で東の箱 (4,3) を押す）", () => {
    const crateAt4_3 = MAP.cratePositions.some((p) => p.col === 4 && p.row === 3);
    if (!crateAt4_3) {
      throw new Error("テスト前提: MAP.cratePositions に (4,3) が含まれていること");
    }

    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.position).toEqual({ col: 3, row: 3 });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD" }));
    });

    expect(result.current.position).toEqual({ col: 4, row: 3 });
    const pushedCrate = result.current.cratePositions.find((p) => p.col === 5 && p.row === 3);
    expect(pushedCrate).toBeDefined();
  });

  it("空きタイルへは通常通り移動する", () => {
    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.position).toEqual({ col: 3, row: 3 });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(result.current.position).toEqual({ col: 3, row: 2 });
  });

  it("移動すると向きが移動方向に変わる", () => {
    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.facing).toBe(PLAYER.initialFacing);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(result.current.facing).toBe("n");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD" }));
    });
    expect(result.current.facing).toBe("e");
  });
});
