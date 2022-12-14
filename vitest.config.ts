/// <reference types="vitest" />
import { defineConfig } from "vite";
import type { UserConfig as VitestUserConfigInterface } from "vitest/config";

const vitestConfig: VitestUserConfigInterface = {
  test: {
    globals: true,
    typecheck: { tsconfig: "./tsconfig-base-testing.json" },
    coverage: {
      reporter: ["text", "json", "html"],
      provider: "istanbul",
    },
  },
};

export default defineConfig({
  test: vitestConfig.test,
});
