/**
 * @magicsim/core
 * 魔法の属性定義・ロジック共通型
 * 将来のAWS Lambdaと共有する想定
 */

// ---------------------------------------------------------------------------
// グリッド・プレイヤー移動
// ---------------------------------------------------------------------------

/** グリッド上の移動方向（WASD に対応） */
export type GridDirection = "n" | "s" | "e" | "w";

export interface GridPosition {
  col: number;
  row: number;
}

/** グリッド境界内で1タイル分移動。範囲外には出ない。 */
export function moveGridPosition(
  pos: GridPosition,
  direction: GridDirection,
  cols: number,
  rows: number
): GridPosition {
  let col = pos.col;
  let row = pos.row;
  if (direction === "n") row = Math.max(0, row - 1);
  else if (direction === "s") row = Math.min(rows - 1, row + 1);
  else if (direction === "e") col = Math.min(cols - 1, col + 1);
  else if (direction === "w") col = Math.max(0, col - 1);
  return { col, row };
}

// ---------------------------------------------------------------------------
// 魔法システムの型定義
// ---------------------------------------------------------------------------

/** オブジェクトの状態（被弾影響） */
export type ObjectStatus = "normal" | "burning";

/** オブジェクトに付与される状態データ */
export interface StatusEffect {
  status: ObjectStatus;
  /** 経過時間（秒） - burning の場合、黒さの進行度に使用 */
  elapsed: number;
}

/** 魔法の種類 */
export type MagicType = "fire" | "water";

/** 魔法の基本パラメータ（将来 Amazon Bedrock から受け取る想定） */
export interface MagicParams {
  type: MagicType;
  /** 色（hex or rgb） */
  color: string | [number, number, number];
  /** 威力・影響度 */
  power: number;
  /** 追加の挙動パラメータ */
  behavior?: Record<string, unknown>;
}

/** 魔法弾のインスタンス情報 */
export interface MagicProjectileData {
  id: string;
  type: MagicType;
  params: MagicParams;
  /** 発射時刻（将来のログ用） */
  firedAt: Date;
}

/** 魔法使用イベント（将来 Lambda/DynamoDB 保存用） */
export interface MagicUsageEvent {
  magicType: MagicType;
  params: MagicParams;
  timestamp: string; // ISO8601
  /** 将来的にユーザーID等を追加 */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// MagicSystem インターフェース
// ---------------------------------------------------------------------------

export interface MagicSystem {
  /** 魔法タイプ */
  readonly type: MagicType;

  /** 弾の色 [r, g, b] (0-1) */
  readonly color: [number, number, number];

  /** 着弾時の処理: 対象の状態を更新 */
  onHit(target: StatusEffect): StatusEffect;

  /** 弾が着弾したかどうかの判定ロジック（必要に応じて） */
  shouldExtinguish?: (target: StatusEffect) => boolean;
}

// ---------------------------------------------------------------------------
// Fire 魔法システム
// ---------------------------------------------------------------------------

export class FireMagicSystem implements MagicSystem {
  readonly type = "fire" as const;
  readonly color: [number, number, number] = [1, 0.2, 0];

  onHit(_target: StatusEffect): StatusEffect {
    return {
      status: "burning",
      elapsed: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Water 魔法システム
// ---------------------------------------------------------------------------

export class WaterMagicSystem implements MagicSystem {
  readonly type = "water" as const;
  readonly color: [number, number, number] = [0.2, 0.5, 1];

  onHit(_target: StatusEffect): StatusEffect {
    return {
      status: "normal",
      elapsed: 0,
    };
  }

  shouldExtinguish(target: StatusEffect): boolean {
    return target.status === "burning";
  }
}

// ---------------------------------------------------------------------------
// MagicFactory - 魔法の生成を集約（将来 Bedrock パラメータ対応）
// ---------------------------------------------------------------------------

export class MagicFactory {
  private static systems = new Map<MagicType, MagicSystem>([
    ["fire", new FireMagicSystem()],
    ["water", new WaterMagicSystem()],
  ] as [MagicType, MagicSystem][]);

  /**
   * 魔法タイプから MagicSystem を取得
   * 将来: Amazon Bedrock API からカスタムパラメータを受け取り、
   * 動的に色・威力・挙動を生成する
   */
  static getSystem(type: MagicType): MagicSystem {
    const system = this.systems.get(type);
    if (!system) {
      throw new Error(`Unknown magic type: ${type}`);
    }
    return system;
  }

  /**
   * 外部パラメータから MagicParams を生成
   * TODO: 将来 Amazon Bedrock のレスポンスをここでパース
   */
  static createParams(type: MagicType, overrides?: Partial<MagicParams>): MagicParams {
    const system = this.getSystem(type);
    const [r, g, b] = system.color;
    const baseColor = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;

    return {
      type,
      color: baseColor,
      power: 1,
      ...overrides,
    };
  }
}
