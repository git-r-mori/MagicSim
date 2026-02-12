import { useRef, useEffect, useCallback } from "react";
import { PLAYER } from "@/config/constants";

const PLAYER_KEY_CODES: readonly string[] = Object.values(PLAYER.keys);

export interface MoveState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

const INITIAL_MOVE_STATE: MoveState = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
};

/** ウィンドウ blur 時に全キーをリセット。keyup が発火せず「押したまま」残るのを防ぐ。 */
export function resetMoveState(state: MoveState): void {
  state.forward = false;
  state.back = false;
  state.left = false;
  state.right = false;
  state.jump = false;
}

/**
 * プレイヤー移動用キーボード入力。
 * 押下中キーを Set で管理し、e.repeat や keyup 欠落に堅牢に対応する。
 * blur/visibilitychange で全キーをリセットする。
 */
export function usePlayerKeyboard() {
  const moveRef = useRef<MoveState>({ ...INITIAL_MOVE_STATE });
  const keysDownRef = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (PLAYER_KEY_CODES.includes(e.code)) e.preventDefault();
    keysDownRef.current.add(e.code);
    if (e.code === PLAYER.keys.w) moveRef.current.forward = true;
    if (e.code === PLAYER.keys.a) moveRef.current.left = true;
    if (e.code === PLAYER.keys.s) moveRef.current.back = true;
    if (e.code === PLAYER.keys.d) moveRef.current.right = true;
    if (e.code === PLAYER.keys.space) moveRef.current.jump = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!keysDownRef.current.has(e.code)) return;
    keysDownRef.current.delete(e.code);
    if (e.code === PLAYER.keys.w) moveRef.current.forward = false;
    if (e.code === PLAYER.keys.a) moveRef.current.left = false;
    if (e.code === PLAYER.keys.s) moveRef.current.back = false;
    if (e.code === PLAYER.keys.d) moveRef.current.right = false;
  }, []);

  const handleBlur = useCallback(() => {
    keysDownRef.current.clear();
    resetMoveState(moveRef.current);
  }, []);

  useEffect(() => {
    // キャプチャフェーズで登録し、他コンポーネントの stopPropagation 等の影響を受けにくくする
    const capture = true;
    window.addEventListener("keydown", handleKeyDown, capture);
    window.addEventListener("keyup", handleKeyUp, capture);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, capture);
      window.removeEventListener("keyup", handleKeyUp, capture);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  return moveRef;
}
