import fs from "node:fs";
import esbuild from "esbuild";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Externalize all dependencies EXCEPT the local monorepo packages (which start with @kaneo/)
const externalDependencies = Object.keys(packageJson.dependencies || {}).filter(
  (dep) => !dep.startsWith("@kaneo/"),
);

const builtins = [
  "fs",
  "path",
  "crypto",
  "os",
  "util",
  "stream",
  "buffer",
  "events",
  "url",
  "querystring",
  "http",
  "https",
  "net",
  "tls",
  "zlib",
];

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outdir: "dist",
    format: "esm",
    external: [...externalDependencies, ...builtins],
  })
  .catch(() => process.exit(1));
