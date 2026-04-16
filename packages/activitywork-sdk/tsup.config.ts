import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "endpoints/preview": "src/endpoints/preview.ts",
    "endpoints/snapshot": "src/endpoints/snapshot.ts",
    "endpoints/apps": "src/endpoints/apps.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
