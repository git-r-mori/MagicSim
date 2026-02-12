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

/** 指定座標が障害物タイルに含まれるか */
export function isTileBlocked(pos: GridPosition, blockedTiles: readonly GridPosition[]): boolean {
  return blockedTiles.some((b) => b.col === pos.col && b.row === pos.row);
}

/**
 * 炎魔法弾の着弾位置を算出。
 * 発射位置から指定方向へ進み、木箱・境界に当たるか maxTiles に達するまで進む。
 */
export function getFireProjectileEndPosition(
  start: GridPosition,
  direction: GridDirection,
  blockedTiles: readonly GridPosition[],
  cols: number,
  rows: number,
  maxTiles: number
): GridPosition {
  let current = { ...start };
  for (let step = 0; step < maxTiles; step++) {
    const next = moveGridPosition(current, direction, cols, rows);
    if (next.col === current.col && next.row === current.row) return current;
    if (isTileBlocked(next, blockedTiles)) return current;
    current = next;
  }
  return current;
}

/** tryMoveWithPush の戻り値 */
export interface TryMoveResult {
  success: boolean;
  newPlayerPos: GridPosition;
  newCratePositions: GridPosition[];
}

/**
 * プレイヤー移動を試行。木箱タイルの場合は押す。
 * - 次のタイルが空 → プレイヤーのみ移動
 * - 次のタイルに木箱 → 箱の向こうが有効（枠内かつ他箱なし）ならプレイヤーと箱を同時移動
 * - 押せない（端・他箱がある）場合は何もせず失敗
 */
export function tryMoveWithPush(
  playerPos: GridPosition,
  direction: GridDirection,
  cratePositions: readonly GridPosition[],
  cols: number,
  rows: number
): TryMoveResult {
  const next = moveGridPosition(playerPos, direction, cols, rows);
  const crateAtNext = cratePositions.find((c) => c.col === next.col && c.row === next.row);

  if (!crateAtNext) {
    return {
      success: true,
      newPlayerPos: next,
      newCratePositions: [...cratePositions],
    };
  }

  const beyond = moveGridPosition(next, direction, cols, rows);
  if (beyond.col === next.col && beyond.row === next.row) {
    return { success: false, newPlayerPos: playerPos, newCratePositions: [...cratePositions] };
  }
  const blockedAtBeyond = cratePositions.some((c) => c.col === beyond.col && c.row === beyond.row);
  if (blockedAtBeyond) {
    return { success: false, newPlayerPos: playerPos, newCratePositions: [...cratePositions] };
  }

  const newCratePositions = cratePositions.map((c) =>
    c.col === next.col && c.row === next.row ? beyond : c
  );
  return {
    success: true,
    newPlayerPos: next,
    newCratePositions,
  };
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
