import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const options = parseArgs(process.argv.slice(2));
const publicRoot = resolve(projectRoot, options.root || "public");
const dataPath = options.data ? resolve(projectRoot, options.data) : "";
const port = Number(options.port || process.env.PORT || 8788);

if (!existsSync(publicRoot)) {
  console.error(`Static root does not exist: ${publicRoot}`);
  process.exit(1);
}

if (dataPath) {
  try {
    JSON.parse(await readFile(dataPath, "utf8"));
  } catch (error) {
    console.error(`Static data JSON is not valid: ${dataPath}`);
    console.error(error.message);
    process.exit(1);
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (dataPath && url.pathname === "/app/static-data.json") {
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8"
    });
    createReadStream(dataPath).pipe(response);
    return;
  }

  const filePath = await resolveStaticPath(url.pathname);
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": contentType(filePath)
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Serving ${publicRoot}`);
  if (dataPath) console.log(`Static JSON import: ${dataPath} -> /app/static-data.json`);
  console.log(`Open http://localhost:${port}/app/`);
});

async function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const candidate = resolve(publicRoot, relativePath);
  if (!isInside(publicRoot, candidate)) return "";

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const indexPath = join(candidate, "index.html");
      return existsSync(indexPath) ? indexPath : "";
    }
    return info.isFile() ? candidate : "";
  } catch {
    return "";
  }
}

function isInside(root, candidate) {
  const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`;
  return candidate === root || candidate.startsWith(normalizedRoot);
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--data") parsed.data = args[++index];
    else if (arg.startsWith("--data=")) parsed.data = arg.slice("--data=".length);
    else if (arg === "--port") parsed.port = args[++index];
    else if (arg.startsWith("--port=")) parsed.port = arg.slice("--port=".length);
    else if (arg === "--root") parsed.root = args[++index];
    else if (arg.startsWith("--root=")) parsed.root = arg.slice("--root=".length);
  }
  return parsed;
}

function contentType(filePath) {
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".webp": "image/webp"
  }[extname(filePath).toLowerCase()] || "application/octet-stream";
}
