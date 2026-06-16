import deno from "@deno/vite-plugin";
import { build as buildGtkxBundle } from "@gtkx/cli";
import { resolve } from "node:path";

const bundleOnly = Deno.args.includes("--bundle-only");
const distDir = "dist";
const bundlePath = `${distDir}/bundle.js`;
const nativePath = `${distDir}/gtkx.node`;
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
    nativePath,
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

await Deno.remove(bundlePath);
await Deno.remove(nativePath);

async function assertFreshFile(path: string) {
  const stat = await Deno.stat(path);
  if (!stat.isFile) {
    throw new Error(`Expected ${path} to be a file`);
  }
}
