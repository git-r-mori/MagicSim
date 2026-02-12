import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayerMovement, CRATE_DESTROYED_EVENT } from "./usePlayerMovement";
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

  it("炎魔法で木箱に当たると木箱が焼失する（CRATE_DESTROYED_EVENT）", () => {
    const crateAt4_3 = MAP.cratePositions.some((p) => p.col === 4 && p.row === 3);
    if (!crateAt4_3) {
      throw new Error("テスト前提: MAP.cratePositions に (4,3) が含まれていること");
    }

    const { result } = renderHook(() => usePlayerMovement());
    expect(result.current.cratePositions.some((c) => c.col === 4 && c.row === 3)).toBe(true);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(CRATE_DESTROYED_EVENT, {
          detail: { col: 4, row: 3 },
        })
      );
    });

    expect(result.current.cratePositions.some((c) => c.col === 4 && c.row === 3)).toBe(false);
    expect(result.current.cratePositions).toHaveLength(MAP.cratePositions.length - 1);
  });

  it("ESC でマップ状態が初期化される", () => {
    const { result } = renderHook(() => usePlayerMovement());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD" }));
    });
    expect(result.current.position).not.toEqual({
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    });
    const crateBeforeReset = result.current.cratePositions.find((p) => p.col === 5 && p.row === 3);
    expect(crateBeforeReset).toBeDefined();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    });

    expect(result.current.position).toEqual({
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    });
    expect(result.current.facing).toBe(PLAYER.initialFacing);
    expect(result.current.cratePositions).toHaveLength(MAP.cratePositions.length);
    const crateAt4_3 = result.current.cratePositions.some((p) => p.col === 4 && p.row === 3);
    expect(crateAt4_3).toBe(true);
  });
});
