import { useState, useEffect, useCallback, useRef } from "react";
import { tryMoveWithPush, type GridDirection } from "@magicsim/core";
import { GRID, MAP, MOVE_ANIMATION, PLAYER } from "@/config/constants";
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
  facing: GridDirection;
  cratePositions: CratePosition[];
}

/** 表示用の補間位置（アニメーション中は col/row が小数になる） */
export interface DisplayPosition {
  col: number;
  row: number;
}

export interface BurningCrateDisplay {
  col: number;
  row: number;
  /** 0〜1。1で消滅 */
  progress: number;
}

export interface PlayerMovementDisplayState {
  displayPosition: DisplayPosition;
  displayFacing: GridDirection;
  /** 表示用 Y 軸回転（rad）。アニメーション中は補間される */
  displayRotationY: number;
  displayCratePositions: DisplayPosition[];
  /** 燃焼中の木箱（炎魔法で被弾後、消失アニメーション中） */
  displayBurningCrates: BurningCrateDisplay[];
}

const INITIAL_CRATE_POSITIONS: CratePosition[] = MAP.cratePositions.map((p) => ({ ...p }));

/** GridDirection を Y軸回転（rad）に変換。南を基準0。 */
const DIRECTION_TO_Y_RAD: Record<GridDirection, number> = {
  s: 0,
  n: Math.PI,
  e: Math.PI / 2,
  w: -Math.PI / 2,
};

const INITIAL_STATE: PlayerMovementState = {
  position: { col: PLAYER.initialCol, row: PLAYER.initialRow },
  facing: PLAYER.initialFacing,
  cratePositions: INITIAL_CRATE_POSITIONS.map((p) => ({ ...p })),
};

const INITIAL_DISPLAY: PlayerMovementDisplayState = {
  displayPosition: { col: PLAYER.initialCol, row: PLAYER.initialRow },
  displayFacing: PLAYER.initialFacing,
  displayRotationY: DIRECTION_TO_Y_RAD[PLAYER.initialFacing],
  displayCratePositions: INITIAL_CRATE_POSITIONS.map((p) => ({ ...p })),
  displayBurningCrates: [],
};

export const MAP_RESET_EVENT = "magicsim:reset-map";
export const CRATE_DESTROYED_EVENT = "magicsim:crate-destroyed";

/** マップリセットを発火。全 usePlayerMovement インスタンスがリセットされる */
export function dispatchMapReset(): void {
  window.dispatchEvent(new CustomEvent(MAP_RESET_EVENT));
}

/** easeOutCubic: 終端で自然に減速 */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function lerpPosition(
  from: { col: number; row: number },
  to: { col: number; row: number },
  t: number
): DisplayPosition {
  return {
    col: from.col + (to.col - from.col) * t,
    row: from.row + (to.row - from.row) * t,
  };
}

/** 角度を最短経路で補間 */
function lerpAngle(fromRad: number, toRad: number, t: number): number {
  let diff = toRad - fromRad;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return fromRad + diff * t;
}

/**
 * プレイヤー位置と木箱配置を管理。WASD でタイル単位に移動。
 * 木箱タイルに進入する場合、押せるならプレイヤーと箱を同時移動。
 * 表示はスライドアニメーションで補間する。
 */
export function usePlayerMovement(): PlayerMovementState & PlayerMovementDisplayState {
  const [state, setState] = useState<PlayerMovementState>({
    position: {
      col: PLAYER.initialCol,
      row: PLAYER.initialRow,
    },
    facing: PLAYER.initialFacing,
    cratePositions: INITIAL_CRATE_POSITIONS,
  });

  const [display, setDisplay] = useState<PlayerMovementDisplayState>(() => ({
    displayPosition: { col: PLAYER.initialCol, row: PLAYER.initialRow },
    displayFacing: PLAYER.initialFacing,
    displayRotationY: DIRECTION_TO_Y_RAD[PLAYER.initialFacing],
    displayCratePositions: INITIAL_CRATE_POSITIONS.map((p) => ({ ...p })),
    displayBurningCrates: [],
  }));

  const burningCratesRef = useRef<Array<{ col: number; row: number; burnStartedAt: number }>>([]);

  const animRef = useRef<{
    from: Pick<PlayerMovementState, "position" | "facing" | "cratePositions">;
    to: Pick<PlayerMovementState, "position" | "facing" | "cratePositions">;
    startTime: number;
  } | null>(null);

  const displayRef = useRef(display);
  displayRef.current = display;

  const performReset = useCallback(() => {
    animRef.current = null;
    burningCratesRef.current = [];
    setState({
      ...INITIAL_STATE,
      cratePositions: INITIAL_CRATE_POSITIONS.map((p) => ({ ...p })),
    });
    setDisplay((prev) => ({
      ...prev,
      ...INITIAL_DISPLAY,
      displayCratePositions: INITIAL_CRATE_POSITIONS.map((p) => ({ ...p })),
      displayBurningCrates: [],
    }));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Escape") {
      e.preventDefault();
      dispatchMapReset();
      return;
    }
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
        facing: direction,
        cratePositions: result.newCratePositions,
      };
    });
  }, []);

  useEffect(() => {
    const capture = true;
    window.addEventListener("keydown", handleKeyDown, capture);
    return () => window.removeEventListener("keydown", handleKeyDown, capture);
  }, [handleKeyDown]);

  useEffect(() => {
    const handler = () => performReset();
    window.addEventListener(MAP_RESET_EVENT, handler);
    return () => window.removeEventListener(MAP_RESET_EVENT, handler);
  }, [performReset]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { col, row } = (e as CustomEvent<{ col: number; row: number }>).detail;
      const now = performance.now();
      burningCratesRef.current = [...burningCratesRef.current, { col, row, burnStartedAt: now }];
      setDisplay((prev) => ({
        ...prev,
        displayBurningCrates: [...prev.displayBurningCrates, { col, row, progress: 0 }],
      }));
      setState((prev) => ({
        ...prev,
        cratePositions: prev.cratePositions.filter((c) => !(c.col === col && c.row === row)),
      }));
    };
    window.addEventListener(CRATE_DESTROYED_EVENT, handler);
    return () => window.removeEventListener(CRATE_DESTROYED_EVENT, handler);
  }, []);

  useEffect(() => {
    const from = displayRef.current;
    const samePos =
      state.position.col === from.displayPosition.col &&
      state.position.row === from.displayPosition.row;
    const sameCrates =
      state.cratePositions.length === from.displayCratePositions.length &&
      state.cratePositions.every(
        (c, i) =>
          c.col === from.displayCratePositions[i]?.col &&
          c.row === from.displayCratePositions[i]?.row
      );
    if (samePos && sameCrates) return;

    if (state.cratePositions.length !== from.displayCratePositions.length) {
      animRef.current = null;
      setDisplay({
        displayPosition: { ...state.position },
        displayFacing: state.facing,
        displayRotationY: DIRECTION_TO_Y_RAD[state.facing],
        displayCratePositions: state.cratePositions.map((p) => ({ ...p })),
        displayBurningCrates: from.displayBurningCrates,
      });
      return;
    }

    if (
      animRef.current &&
      state.position.col === animRef.current.to.position.col &&
      state.position.row === animRef.current.to.position.row &&
      state.cratePositions.length === animRef.current.to.cratePositions.length &&
      animRef.current.to.cratePositions.every(
        (c, i) => c.col === state.cratePositions[i]?.col && c.row === state.cratePositions[i]?.row
      )
    ) {
      return;
    }
    animRef.current = {
      from: {
        position: { ...displayRef.current.displayPosition },
        facing: displayRef.current.displayFacing,
        cratePositions: displayRef.current.displayCratePositions.map((p) => ({ ...p })),
      },
      to: {
        position: { ...state.position },
        facing: state.facing,
        cratePositions: state.cratePositions.map((p) => ({ ...p })),
      },
      startTime: performance.now(),
    };
  }, [state]);

  useEffect(() => {
    const BURN_DURATION = MAP.crateBurn.durationMs;
    let raf: number;
    const tick = () => {
      const now = performance.now();
      const prev = displayRef.current;

      let displayBurningCrates = prev.displayBurningCrates;
      const burning = burningCratesRef.current;
      if (burning.length > 0) {
        const next: BurningCrateDisplay[] = [];
        const stillBurning: typeof burning = [];
        for (const b of burning) {
          const progress = Math.min(1, (now - b.burnStartedAt) / BURN_DURATION);
          if (progress < 1) {
            next.push({ col: b.col, row: b.row, progress });
            stillBurning.push(b);
          }
        }
        burningCratesRef.current = stillBurning;
        displayBurningCrates = next;
      } else {
        displayBurningCrates = [];
      }

      const anim = animRef.current;
      if (!anim) {
        setDisplay((p) => ({ ...p, displayBurningCrates }));
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - anim.startTime;
      const t = Math.min(1, elapsed / MOVE_ANIMATION.durationMs);
      const eased = easeOutCubic(t);

      const displayRotationY = lerpAngle(
        DIRECTION_TO_Y_RAD[anim.from.facing],
        DIRECTION_TO_Y_RAD[anim.to.facing],
        eased
      );

      setDisplay({
        displayPosition: lerpPosition(anim.from.position, anim.to.position, eased),
        displayFacing: anim.to.facing,
        displayRotationY,
        displayCratePositions: anim.from.cratePositions.map((c, i) =>
          lerpPosition(c, anim.to.cratePositions[i] ?? c, eased)
        ),
        displayBurningCrates,
      });

      if (t >= 1) {
        animRef.current = null;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    ...state,
    displayPosition: display.displayPosition,
    displayFacing: display.displayFacing,
    displayRotationY: display.displayRotationY,
    displayCratePositions: display.displayCratePositions,
    displayBurningCrates: display.displayBurningCrates,
  };
}
