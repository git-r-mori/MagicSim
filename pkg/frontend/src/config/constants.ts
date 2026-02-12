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
  /** 草原タイルの色（軽いバリエーションで自然な感じに） */
  grasslandColors: [
    "#4a7c59", // 濃いめの緑
    "#5a9c69", // 標準の緑
    "#3d6b47", // 深緑
    "#6bb37a", // 明るい緑
  ] as const,
} as const;

/** プレイヤー（WASD 用キーコード） */
export const PLAYER = {
  keys: {
    w: "KeyW",
    a: "KeyA",
    s: "KeyS",
    d: "KeyD",
    space: "Space",
  } as const,
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
