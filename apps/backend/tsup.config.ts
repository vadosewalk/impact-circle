import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  // Bundle EVERYTHING into a single file so we don't need node_modules at runtime
  noExternal: [/.*/],
  // Mark Node built-ins as external (they ship with the runtime)
  platform: "node",
  target: "node20",
  banner: {
    // Required for ESM compatibility with some packages that use __dirname
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});
