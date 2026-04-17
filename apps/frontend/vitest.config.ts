import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "components/common/empty-state.tsx",
        "components/common/status-badge.tsx",
        "components/po/po-lifecycle-actions.tsx",
        "components/po/status-legend.tsx",
        "lib/catalog.ts",
        "lib/draft.ts",
        "lib/validations.ts"
      ],
      thresholds: {
        lines: 70,
        branches: 55,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
