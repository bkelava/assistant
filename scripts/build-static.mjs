import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const options = parseArgs(process.argv.slice(2));
const sourceRoot = resolve(projectRoot, "public");
const outputRoot = resolve(projectRoot, options.out || "dist");
const dataPath = options.data ? resolve(projectRoot, options.data) : "";

if (dataPath) {
  try {
    JSON.parse(await readFile(dataPath, "utf8"));
  } catch (error) {
    console.error(`Static data JSON is not valid: ${dataPath}`);
    console.error(error.message);
    process.exit(1);
  }
}

await rm(outputRoot, { recursive: true, force: true });
await cp(sourceRoot, outputRoot, { recursive: true });

if (dataPath) {
  const targetPath = resolve(outputRoot, "app/static-data.json");
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readFile(dataPath, "utf8"));
}

console.log(`Built static site in ${outputRoot}`);
if (dataPath) console.log(`Included static JSON import at ${resolve(outputRoot, "app/static-data.json")}`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--data") parsed.data = args[++index];
    else if (arg.startsWith("--data=")) parsed.data = arg.slice("--data=".length);
    else if (arg === "--out") parsed.out = args[++index];
    else if (arg.startsWith("--out=")) parsed.out = arg.slice("--out=".length);
  }
  return parsed;
}
