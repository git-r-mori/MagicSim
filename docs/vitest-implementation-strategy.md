# Vitest 導入・テスト実装戦略

## 1. 方針

| 項目       | 方針                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 配置       | ルートに Vitest をインストールし、ワークスペースで pkg/core / pkg/frontend を統合 |
| 実行       | コミットごとに `npm run test` で全パッケージのテストを一括実行                    |
| 環境       | pkg/core は `node`、pkg/frontend は `jsdom`（React コンポーネント用、将来）       |
| テスト配置 | 対象ソースと同じディレクトリに `*.test.ts` / `*.test.tsx` を置く（colocation）    |

---

## 2. 導入フェーズ

### Phase 1: Vitest セットアップ

1. **依存関係の追加**
   - ルート `package.json` に `vitest` を devDependencies 追加
   - ワークスペース単位で動かすため、ルートに集約

2. **設定ファイルの構成**

   ```
   MagicSim/
   ├── vitest.config.ts       # ルート設定（test.projects で pkg/core, pkg/frontend）
   ├── pkg/
   │   ├── core/
   │   │   └── vitest.config.ts   # node 環境、src/**/*.test.ts
   │   └── frontend/
   │       └── vite.config.ts     # test セクション追加（jsdom、@ エイリアス継承）
   ```

3. **npm スクリプト**
   - `test`: `vitest run`（CI / pre-commit 用）
   - `test:watch`: `vitest`（開発中の watch モード）

---

### Phase 2: pkg/core のユニットテスト（優先度: 高）

**対象**: `pkg/core/src/index.ts`

| テスト対象                          | ケース                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `FireMagicSystem.onHit`             | 任意の StatusEffect を渡すと `{ status: "burning", elapsed: 0 }` を返す |
| `WaterMagicSystem.onHit`            | 任意の StatusEffect を渡すと `{ status: "normal", elapsed: 0 }` を返す  |
| `WaterMagicSystem.shouldExtinguish` | `status: "burning"` で `true`、`status: "normal"` で `false`            |
| `MagicFactory.getSystem`            | `"fire"` / `"water"` で対応する MagicSystem を返す                      |
| `MagicFactory.getSystem`            | 未知のタイプで `Error` をスローする                                     |
| `MagicFactory.createParams`         | 指定タイプで color（rgb 形式）・power を含む MagicParams を返す         |
| `MagicFactory.createParams`         | overrides が正しくマージされる                                          |

**配置**: `pkg/core/src/index.test.ts`

---

### Phase 3: pre-commit への組み込み

**変更ファイル**: `.husky/pre-commit`

```
npm run typecheck
npm run test
npx lint-staged
```

- 実行順: typecheck → test → lint-staged（型チェック → テスト → リント）
- `npm run test` は数十秒以内に終わる想定（pkg/core のみなら数秒）

---

### Phase 4: pkg/frontend のテスト（優先度: 中・将来）

| 対象                 | 優先度 | 備考                                                                          |
| -------------------- | ------ | ----------------------------------------------------------------------------- |
| `useMagicAI`         | 中     | initialType による返却値の分岐を検証可能。`@testing-library/react` 導入を検討 |
| `logMagicUsage`      | 低     | console.log のモックが必要。現状はロジックが単純で優先度低                    |
| React コンポーネント | 低     | Three.js/R3F 依存が強く、モックが重い。Playwright で画面ベース検証を継続      |

---

### Phase 5: ドキュメント更新

- `README.md`: テスト実行方法、プロジェクト構成（`vitest.config.ts` 等）を追記
- `docs/vitest-implementation-strategy.md`: 本ドキュメントをプロジェクトに追加

---

## 3. ファイル構成（導入後）

```
MagicSim/
├── vitest.config.ts
├── package.json              # scripts: test, test:watch
├── pkg/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── index.test.ts   # 新規
│   │   ├── vitest.config.ts    # 新規
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   └── ...
│       ├── vite.config.ts      # test セクション追加
│       └── package.json
├── .husky/pre-commit          # npm run test 追加
├── docs/
│   └── vitest-implementation-strategy.md
└── README.md                  # テスト実行手順追加
```

---

## 4. 実装順序

1. Phase 1（セットアップ）→ `npm run test` がエラーなく動作することを確認
2. Phase 2（pkg/core テスト）→ 全テストがグリーンになることを確認
3. Phase 3（pre-commit）→ コミット試行でテストが実行されることを確認
4. Phase 5（README）→ 手順を記載
5. Phase 4 は必要に応じて後から追加

---

## 5. カバレッジ

- **目標**: pkg/core で行・関数・分岐 80%
- **実行**: `npm run test -- --coverage`
- **閾値**: `pkg/core/vitest.config.ts` の `thresholds` で定義

## 6. 注意点

- **pkg/core のビルド**: テストは `src/` を直接対象とし、`dist/` は参照しない
- **ワークスペース**: ルート `vitest.config.ts` の `test.projects` でプロジェクトを列挙し、`vitest run` が全パッケージのテストを検出する
- **定数**: テスト内での数値リテラルは、`@magicsim/core` や constants の export を参照する（マジックナンバー回避）
