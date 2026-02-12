import { describe, it, expect } from "vitest";
import {
  FireMagicSystem,
  WaterMagicSystem,
  MagicFactory,
  moveGridPosition,
  isTileBlocked,
  tryMoveWithPush,
  getFireProjectileEndPosition,
  type StatusEffect,
  type MagicType,
} from "./index";

/** createParams と同様の rgb 変換（テスト用・モジュール export 参照） */
function rgbFromColor([r, g, b]: [number, number, number]): string {
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

describe("FireMagicSystem", () => {
  const system = new FireMagicSystem();

  it("onHit returns burning status with elapsed 0 for any target", () => {
    const targets: StatusEffect[] = [
      { status: "normal", elapsed: 0 },
      { status: "burning", elapsed: 5 },
    ];
    for (const target of targets) {
      const result = system.onHit(target);
      expect(result).toEqual({
        status: "burning",
        elapsed: 0,
      });
    }
  });
});

describe("WaterMagicSystem", () => {
  const system = new WaterMagicSystem();

  it("onHit returns normal status with elapsed 0 for any target", () => {
    const targets: StatusEffect[] = [
      { status: "normal", elapsed: 0 },
      { status: "burning", elapsed: 3 },
    ];
    for (const target of targets) {
      const result = system.onHit(target);
      expect(result).toEqual({
        status: "normal",
        elapsed: 0,
      });
    }
  });

  it("shouldExtinguish returns true when target status is burning", () => {
    expect(system.shouldExtinguish({ status: "burning", elapsed: 1 })).toBe(true);
  });

  it("shouldExtinguish returns false when target status is normal", () => {
    expect(system.shouldExtinguish({ status: "normal", elapsed: 0 })).toBe(false);
  });
});

describe("MagicFactory.getSystem", () => {
  it("returns FireMagicSystem for fire type", () => {
    const system = MagicFactory.getSystem("fire");
    expect(system.type).toBe("fire");
    expect(system.color).toEqual(new FireMagicSystem().color);
  });

  it("returns WaterMagicSystem for water type", () => {
    const system = MagicFactory.getSystem("water");
    expect(system.type).toBe("water");
    expect(system.color).toEqual(new WaterMagicSystem().color);
  });

  it("throws Error for unknown magic type", () => {
    expect(() => MagicFactory.getSystem("unknown" as MagicType)).toThrow(
      "Unknown magic type: unknown"
    );
  });
});

describe("MagicFactory.createParams", () => {
  it("returns MagicParams with color in rgb format and power for fire type", () => {
    const params = MagicFactory.createParams("fire");
    expect(params.type).toBe("fire");
    expect(params.color).toBe(rgbFromColor(new FireMagicSystem().color));
    expect(params.power).toBe(1);
  });

  it("returns MagicParams with color in rgb format and power for water type", () => {
    const params = MagicFactory.createParams("water");
    expect(params.type).toBe("water");
    expect(params.color).toBe(rgbFromColor(new WaterMagicSystem().color));
    expect(params.power).toBe(1);
  });

  it("merges overrides correctly", () => {
    const params = MagicFactory.createParams("fire", {
      power: 2,
      color: "#ff0000",
      behavior: { custom: true },
    });
    expect(params.type).toBe("fire");
    expect(params.power).toBe(2);
    expect(params.color).toBe("#ff0000");
    expect(params.behavior).toEqual({ custom: true });
  });
});

describe("moveGridPosition", () => {
  const COLS = 8;
  const ROWS = 8;

  it("n で row が1減る", () => {
    expect(moveGridPosition({ col: 4, row: 4 }, "n", COLS, ROWS)).toEqual({
      col: 4,
      row: 3,
    });
  });

  it("s で row が1増える", () => {
    expect(moveGridPosition({ col: 4, row: 4 }, "s", COLS, ROWS)).toEqual({
      col: 4,
      row: 5,
    });
  });

  it("e で col が1増える", () => {
    expect(moveGridPosition({ col: 4, row: 4 }, "e", COLS, ROWS)).toEqual({
      col: 5,
      row: 4,
    });
  });

  it("w で col が1減る", () => {
    expect(moveGridPosition({ col: 4, row: 4 }, "w", COLS, ROWS)).toEqual({
      col: 3,
      row: 4,
    });
  });

  it("境界でそれ以上は動かない", () => {
    expect(moveGridPosition({ col: 0, row: 0 }, "w", COLS, ROWS)).toEqual({
      col: 0,
      row: 0,
    });
    expect(moveGridPosition({ col: 0, row: 0 }, "n", COLS, ROWS)).toEqual({
      col: 0,
      row: 0,
    });
    expect(moveGridPosition({ col: 7, row: 7 }, "e", COLS, ROWS)).toEqual({
      col: 7,
      row: 7,
    });
    expect(moveGridPosition({ col: 7, row: 7 }, "s", COLS, ROWS)).toEqual({
      col: 7,
      row: 7,
    });
  });
});

describe("isTileBlocked", () => {
  const blocked = [
    { col: 2, row: 3 },
    { col: 5, row: 5 },
  ];

  it("ブロック済み座標なら true", () => {
    expect(isTileBlocked({ col: 2, row: 3 }, blocked)).toBe(true);
    expect(isTileBlocked({ col: 5, row: 5 }, blocked)).toBe(true);
  });

  it("空き座標なら false", () => {
    expect(isTileBlocked({ col: 0, row: 0 }, blocked)).toBe(false);
    expect(isTileBlocked({ col: 3, row: 3 }, blocked)).toBe(false);
  });

  it("空配列なら常に false", () => {
    expect(isTileBlocked({ col: 2, row: 3 }, [])).toBe(false);
  });
});

describe("getFireProjectileEndPosition", () => {
  const COLS = 8;
  const ROWS = 8;
  const MAX_TILES = 4;

  it("空きタイルのみの場合 maxTiles まで進む", () => {
    const crates: { col: number; row: number }[] = [];
    const result = getFireProjectileEndPosition(
      { col: 3, row: 3 },
      "n",
      crates,
      COLS,
      ROWS,
      MAX_TILES
    );
    expect(result.end).toEqual({ col: 3, row: 0 });
    expect(result.hitCrate).toBeNull();
  });

  it("木箱に当たると木箱のタイルで止まり hitCrate を返す", () => {
    const crates = [{ col: 3, row: 1 }];
    const result = getFireProjectileEndPosition(
      { col: 3, row: 3 },
      "n",
      crates,
      COLS,
      ROWS,
      MAX_TILES
    );
    expect(result.end).toEqual({ col: 3, row: 1 });
    expect(result.hitCrate).toEqual({ col: 3, row: 1 });
  });

  it("直進方向の1タイル先に木箱がある場合は木箱に当たる", () => {
    const crates = [{ col: 3, row: 2 }];
    const result = getFireProjectileEndPosition(
      { col: 3, row: 3 },
      "n",
      crates,
      COLS,
      ROWS,
      MAX_TILES
    );
    expect(result.end).toEqual({ col: 3, row: 2 });
    expect(result.hitCrate).toEqual({ col: 3, row: 2 });
  });

  it("境界で止まる", () => {
    const crates: { col: number; row: number }[] = [];
    const result = getFireProjectileEndPosition(
      { col: 0, row: 2 },
      "w",
      crates,
      COLS,
      ROWS,
      MAX_TILES
    );
    expect(result.end).toEqual({ col: 0, row: 2 });
    expect(result.hitCrate).toBeNull();
  });

  it("maxTiles が 0 なら発射位置のまま", () => {
    const crates: { col: number; row: number }[] = [];
    const result = getFireProjectileEndPosition({ col: 4, row: 4 }, "e", crates, COLS, ROWS, 0);
    expect(result.end).toEqual({ col: 4, row: 4 });
    expect(result.hitCrate).toBeNull();
  });
});

describe("tryMoveWithPush", () => {
  const COLS = 8;
  const ROWS = 8;

  it("空きタイルへはプレイヤーのみ移動し、箱は変わらない", () => {
    const crates = [{ col: 2, row: 2 }];
    const result = tryMoveWithPush({ col: 3, row: 3 }, "n", crates, COLS, ROWS);
    expect(result.success).toBe(true);
    expect(result.newPlayerPos).toEqual({ col: 3, row: 2 });
    expect(result.newCratePositions).toEqual(crates);
  });

  it("木箱を押せる（箱が有効な隣タイルへ移動）", () => {
    const crates = [{ col: 4, row: 3 }];
    const result = tryMoveWithPush({ col: 3, row: 3 }, "e", crates, COLS, ROWS);
    expect(result.success).toBe(true);
    expect(result.newPlayerPos).toEqual({ col: 4, row: 3 });
    expect(result.newCratePositions).toEqual([{ col: 5, row: 3 }]);
  });

  it("木箱が端にある場合は押せない", () => {
    const crates = [{ col: 0, row: 3 }];
    const result = tryMoveWithPush({ col: 1, row: 3 }, "w", crates, COLS, ROWS);
    expect(result.success).toBe(false);
    expect(result.newPlayerPos).toEqual({ col: 1, row: 3 });
    expect(result.newCratePositions).toEqual(crates);
  });

  it("木箱の向こうに別の箱がある場合は押せない", () => {
    const crates = [
      { col: 4, row: 3 },
      { col: 5, row: 3 },
    ];
    const result = tryMoveWithPush({ col: 3, row: 3 }, "e", crates, COLS, ROWS);
    expect(result.success).toBe(false);
    expect(result.newPlayerPos).toEqual({ col: 3, row: 3 });
    expect(result.newCratePositions).toEqual(crates);
  });
});
