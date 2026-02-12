import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["pkg/core", "pkg/frontend"],
  },
});
