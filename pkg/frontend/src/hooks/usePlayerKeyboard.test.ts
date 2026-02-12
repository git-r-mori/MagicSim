import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { resetMoveState, usePlayerKeyboard } from "./usePlayerKeyboard";

describe("resetMoveState", () => {
  it("全てのキーを false にリセットする", () => {
    const state = { forward: true, back: true, left: true, right: true, jump: true };
    resetMoveState(state);
    expect(state).toEqual({
      forward: false,
      back: false,
      left: false,
      right: false,
      jump: false,
    });
  });
});

describe("usePlayerKeyboard", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("keydown で対応するキーが true になる", () => {
    const { result } = renderHook(() => usePlayerKeyboard());
    const moveRef = result.current;

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA" }));
    });
    expect(moveRef.current.left).toBe(true);
  });

  it("keyup で対応するキーが false になる", () => {
    const { result } = renderHook(() => usePlayerKeyboard());
    const moveRef = result.current;

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(false);
  });

  it("blur で全キーがリセットされる（keyup 喪失時の再現）", () => {
    const { result } = renderHook(() => usePlayerKeyboard());
    const moveRef = result.current;

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    });
    expect(moveRef.current.forward).toBe(true);
    expect(moveRef.current.jump).toBe(true);

    act(() => {
      window.dispatchEvent(new FocusEvent("blur"));
    });
    expect(moveRef.current.forward).toBe(false);
    expect(moveRef.current.jump).toBe(false);
    expect(moveRef.current).toEqual({
      forward: false,
      back: false,
      left: false,
      right: false,
      jump: false,
    });
  });

  it("keydown のない keyup は無視される（冗長 keyup 対策）", () => {
    const { result } = renderHook(() => usePlayerKeyboard());
    const moveRef = result.current;

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(false);
  });

  it("blur リセット後も keydown で再度入力可能", () => {
    const { result } = renderHook(() => usePlayerKeyboard());
    const moveRef = result.current;

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    act(() => {
      window.dispatchEvent(new FocusEvent("blur"));
    });
    expect(moveRef.current.forward).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    });
    expect(moveRef.current.forward).toBe(true);
  });
});
