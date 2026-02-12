# MagicSim

2.5D 箱庭パズルゲーム。見下ろし視点のグリッドステージで、魔法の力を使ってパズルを解き進めます。

> 個人開発作品（趣味・学習・ポートフォリオ）。AWS でリリース予定。

---

## 概要

- **ジャンル**: 2.5D パズル
- **コンセプト**: 箱庭ステージで、炎魔法を使って氷を溶かし、ゴールを目指す
- **操作**: WASD で移動、木箱を押して動かせる。タイルをクリックで炎魔法を発動
- **カメラ**: 見下ろし視点、ズーム・パン対応

詳細な仕様は [docs/game-specification.md](docs/game-specification.md) を参照してください。

---

## 技術スタック

| 分類            | 技術                                                 |
| --------------- | ---------------------------------------------------- |
| フロントエンド  | React 19, TypeScript, Vite                           |
| 3D レンダリング | Three.js, React Three Fiber (R3F), @react-three/drei |
| テスト          | Vitest, Playwright                                   |
| 品質            | ESLint, Prettier, Husky, Conventional Commits        |
| インフラ        | AWS (SST v3 / S3 + CloudFront)                       |

モノレポ構成（`pkg/core`: ゲームロジック、`pkg/frontend`: React アプリ）。

---

## クイックスタート

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev
```

```bash
# ビルド
npm run build

# AWS へのデプロイ（SST 使用）
npx sst deploy
```

---

## プロジェクト構成

```
MagicSim/
├── docs/
│   ├── game-specification.md   # ゲーム仕様書
│   └── vitest-implementation-strategy.md
├── pkg/
│   ├── core/                   # ゲームロジック・魔法システム（共有ライブラリ）
│   └── frontend/               # React アプリ（Vite + R3F）
│       └── src/
│           ├── components/    # 3D シーン・UI コンポーネント
│           │   ├── DebugWindow/  # デバッグ用パネル（入力キー・座標・エラーログ）
│           │   └── Scene/        # ゲームシーン
│           ├── config/        # 定数
│           └── hooks/         # カスタムフック
├── e2e/                        # Playwright E2E テスト
├── sst.config.ts               # AWS インフラ定義（S3 + CloudFront）
└── package.json
```

---

## 開発コマンド

| コマンド               | 説明                                 |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | 開発サーバー起動                     |
| `npm run build`        | プロダクションビルド                 |
| `npm run typecheck`    | 型チェック                           |
| `npm run test`         | ユニットテスト（Vitest）＋カバレッジ |
| `npm run test:e2e`     | E2E テスト（Playwright）             |
| `npm run lint`         | ESLint 実行                          |
| `npm run format:check` | Prettier チェック                    |

---

## ライセンス

Private（個人作品）
