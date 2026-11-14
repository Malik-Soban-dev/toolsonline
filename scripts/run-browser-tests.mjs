import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { execFileSync, spawnSync } from "node:child_process";
import chromium from "@sparticuz/chromium";

// The bundled browser and libraries avoid a separate browser-CDN download.
const cache = resolve(".cache/chromium");
mkdirSync(cache, { recursive: true });
const library = resolve(cache, "lib/libnspr4.so");
if (!existsSync(library)) {
  const tar = resolve(cache, "al2023.tar");
  writeFileSync(
    tar,
    brotliDecompressSync(readFileSync("node_modules/@sparticuz/chromium/bin/al2023.tar.br")),
  );
  execFileSync("tar", ["-xf", tar, "-C", cache]);
}
const executablePath = process.env.CHROMIUM_PATH || (await chromium.executablePath());
const result = spawnSync(
  process.execPath,
  ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CHROMIUM_PATH: executablePath,
      LD_LIBRARY_PATH: `${cache}/lib:${process.env.LD_LIBRARY_PATH || ""}`,
    },
  },
);
process.exit(result.status ?? 1);
