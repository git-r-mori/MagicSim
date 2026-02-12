/**
 * アプリ全体の定数・パラメータを一元管理
 */

/** Canvas / WebGL */
export const CANVAS = {
  antialias: true,
  alpha: false,
  stencil: false,
  powerPreference: "high-performance" as const,
  dpr: [1, 2] as [number, number],
} as const;

/** カメラ（見下ろし 2.5D 用） */
export const CAMERA = {
  /** OrthographicCamera の zoom。大きいほどズームイン。画面いっぱいに表示 */
  zoom: 100,
  near: 0.1,
  far: 500,
  /** 初期位置（ステージ中心を見下ろす） */
  position: [0, 15, 0] as [number, number, number],
} as const;

/** シーン環境 */
export const SCENE_ENV = {
  backgroundColor: "#1a1a2e",
  fog: {
    color: "#1a1a2e",
    near: 30,
    far: 100,
  },
} as const;

/** 照明 */
export const LIGHTS = {
  ambient: { intensity: 0.6 },
  directional: {
    main: {
      position: [10, 20, 10] as [number, number, number],
      intensity: 1.5,
    },
  },
} as const;

/** グリッド・ステージ（プロトタイプ用） */
export const GRID = {
  tileSize: 1,
  /** タイル間の見た目の隙間（グリッド線として背景が見える） */
  tileGap: 0.06,
  /** 8x8 グリッド */
  cols: 8,
  rows: 8,
} as const;

/** マップ・タイル色（草原風） */
export const MAP = {
  /** 障害物（木箱）の配置。これらのタイルには侵入不可 */
  cratePositions: [
    { col: 1, row: 1 },
    { col: 6, row: 1 },
    { col: 4, row: 3 }, // 初期位置の東隣（侵入テスト用）
    { col: 2, row: 5 },
    { col: 5, row: 6 },
  ] as const,
  /** 木箱の見た目 */
  crate: {
    bodyColor: "#8b6914",
    edgeColor: "#5c4710",
    height: 0.8,
    size: 0.7,
    /** 燃焼時の色（炎色→焦げ色） */
    burnColor: "#1a0a00",
    burnEdgeColor: "#0d0500",
  } as const,
  /** 木箱燃焼アニメーション（炎魔法で被弾時） */
  crateBurn: {
    durationMs: 500,
  } as const,
  /** 草原タイルの色（軽いバリエーションで自然な感じに） */
  grasslandColors: [
    "#4a7c59", // 濃いめの緑
    "#5a9c69", // 標準の緑
    "#3d6b47", // 深緑
    "#6bb37a", // 明るい緑
  ] as const,
} as const;

/** 移動アニメーション（スライド時間 ms） */
export const MOVE_ANIMATION = {
  durationMs: 120,
} as const;

/** プレイヤー（WASD 用キーコード・配置・見た目） */
export const PLAYER = {
  keys: {
    w: "KeyW",
    a: "KeyA",
    s: "KeyS",
    d: "KeyD",
    space: "Space",
  } as const,
  /** 初期グリッド位置（col, row） */
  initialCol: 3,
  initialRow: 3,
  /** キャラクタ表示（草原上で視認しやすい色） */
  color: "#e8d5a3",
  /** キャラクタの高さ（タイル上面からのオフセット） */
  height: 0.5,
  /** 初期向き（n/s/e/w） */
  initialFacing: "s" as const,
} as const;

/** UI */
export const UI = {
  helpPanel: {
    bottom: 16,
    left: 16,
    padding: "12px 20px",
    background: "rgba(30,30,50,0.95)",
    borderRadius: 8,
    fontSize: 14,
    color: "#e0e0ff",
    zIndex: 10,
    border: "1px solid rgba(100,100,150,0.5)",
  },
} as const;

/** 炎魔法（左クリックで発射） */
export const FIRE_MAGIC = {
  /** 最大飛行タイル数 */
  maxTiles: 4,
  /** 発射〜消失までのアニメーション時間（ms） */
  durationMs: 400,
  /** 炎弾の色 */
  color: "#ff6600",
  /** 炎弾の半径（ワールド単位） */
  radius: 0.2,
} as const;

/** デバッグウィンドウ */
export const DEBUG_WINDOW = {
  /** 画面右端に配置 */
  right: 8,
  top: 8,
  minWidth: 200,
  maxWidth: 320,
  padding: "10px 14px",
  fontSize: 12,
  fontFamily: "monospace",
  background: "rgba(20,20,35,0.95)",
  color: "#b0b0c0",
  border: "1px solid rgba(80,80,120,0.6)",
  borderRadius: 6,
  zIndex: 20,
  lineHeight: 1.5,
  /** セクション間の余白 */
  sectionGap: 8,
  /** エラーログ最大行数 */
  maxErrorLines: 20,
} as const;
