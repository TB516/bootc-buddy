import deno from "@deno/vite-plugin";
import { build as buildGtkxBundle } from "@gtkx/cli";
import { resolve } from "node:path";

const bundleOnly = Deno.args.includes("--bundle-only");
const distDir = "dist";
const bundleDir = `${distDir}/bundle`;
const bundlePath = `${bundleDir}/bundle.js`;
const nativePath = `${bundleDir}/gtkx.node`;
const executablePath = `${distDir}/bootc-buddy-app`;

try {
  await Deno.remove(distDir, { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}

await buildGtkxBundle({
  entry: resolve(Deno.cwd(), "src/main.tsx"),
  vite: {
    root: Deno.cwd(),
    configFile: false,
    build: {
      outDir: bundleDir,
    },
    plugins: [
      deno(),
    ],
  },
});

await assertFreshFile(bundlePath);
await assertFreshFile(nativePath);

if (bundleOnly) {
  Deno.exit(0);
}

const compile = new Deno.Command(Deno.execPath(), {
  args: [
    "compile",
    "-A",
    "--no-check",
    "--node-modules-dir=none",
    "--include",
    bundleDir,
    "--output",
    executablePath,
    bundlePath,
  ],
  stdout: "inherit",
  stderr: "inherit",
});

const status = await compile.spawn().status;
if (!status.success) {
  throw new Error(`deno compile failed with exit code ${status.code}`);
}

async function assertFreshFile(path: string) {
  const stat = await Deno.stat(path);
  if (!stat.isFile) {
    throw new Error(`Expected ${path} to be a file`);
  }
}
