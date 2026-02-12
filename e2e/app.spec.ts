/**
 * アプリの基本動作 E2E テスト
 */
import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("WASD")).toBeVisible({ timeout: 5000 });
});
