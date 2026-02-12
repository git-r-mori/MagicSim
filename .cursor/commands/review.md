# コードレビュー

magic-sim ルール 1.3 準拠。

## 確認項目

1. **検証**: `npm run typecheck`、`test`、`lint`、`format:check`
2. **規約**: 型安全、constants 参照、可読性、DRY、エラー処理
3. **README**: 新規ファイル・構成変更時の更新

## 対象

- 指定なし: `git diff main...HEAD`
- 指定時: コマンド名の後に続けて入力

改善点はファイル名・行番号・問題・修正案を提示。
