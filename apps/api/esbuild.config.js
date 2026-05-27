import fs from "node:fs";
import esbuild from "esbuild";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// We externalize all dependencies EXCEPT the local monorepo packages (which start with @kaneo/)
const dependencies = Object.keys(packageJson.dependencies || {}).filter(
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
    external: [...dependencies, ...builtins, "@modelcontextprotocol/sdk"],
  })
  .catch(() => process.exit(1));
