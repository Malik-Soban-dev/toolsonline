import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml; charset=utf-8",
};
if (!existsSync(root)) {
  console.error("No static export found. Run npm run build first.");
  process.exit(1);
}
createServer((req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method || "GET")) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    const pathname = decodeURIComponent(new URL(req.url, "http://preview.invalid").pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(308, { Location: pathname + "/" });
        res.end();
        return;
      }
      file = resolve(file, "index.html");
    }
    const found = existsSync(file) && statSync(file).isFile();
    if (!found) file = resolve(root, "404.html");
    res.writeHead(found ? 200 : 404, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Cache-Control": pathname.startsWith("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`Online Tools static preview is ready on 0.0.0.0:${port}`),
);
