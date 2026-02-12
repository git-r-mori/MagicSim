import { describe, it, expect } from "vitest";
import {
  FireMagicSystem,
  WaterMagicSystem,
  MagicFactory,
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
