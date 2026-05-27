import fs from "node:fs";
import esbuild from "esbuild";

const _packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Only externalize native/troublesome packages, bundle the rest (like @hono/*)
const externalDependencies = ["bcrypt", "pg", "@modelcontextprotocol/sdk"];

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
