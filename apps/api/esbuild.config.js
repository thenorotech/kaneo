import esbuild from "esbuild";

// Plugin to externalize all bare imports (third-party packages and Node builtins)
// EXCEPT for local monorepo packages starting with "@kaneo/"
const externalizePlugin = {
  name: "externalize-all-except-kaneo",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      // If it's a relative/absolute path or starts with @kaneo/, bundle it
      if (
        args.path.startsWith(".") ||
        args.path.startsWith("/") ||
        args.path.startsWith("@kaneo/")
      ) {
        return null; // continue resolving
      }
      // Otherwise, it's a bare import (like 'fs', 'ws', 'hono'), mark as external
      return { path: args.path, external: true };
    });
  },
};

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outdir: "dist",
    format: "esm",
    plugins: [externalizePlugin],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
