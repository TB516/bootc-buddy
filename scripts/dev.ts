import { spawn, spawnSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";

const buildDir = ".flatpak-build";
const manifest = "build-aux/flatpak/io.github.TB516.BootcBuddy.yml";
const corepackHome = "/app/share/corepack";
const pnpmHome = `${process.cwd()}/${buildDir}/pnpm-home`;

async function cleanupRofiles(): Promise<void> {
  let entries: string[];

  try {
    entries = await readdir(".flatpak-builder/rofiles");
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    entries = [];
  }

  for (const entry of entries) {
    spawnSync("fusermount3", ["-uz", `.flatpak-builder/rofiles/${entry}`], {
      stdio: "ignore",
    });
  }

  await rm(".flatpak-builder/rofiles", { recursive: true, force: true });
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

await cleanupRofiles();
await mkdir(buildDir, { recursive: true });
await mkdir(pnpmHome, { recursive: true });

const buildStatus = spawnSync(
  "flatpak",
  [
    "run",
    "--command=flatpak-builder",
    "org.flatpak.Builder",
    "--system",
    "--assumeyes",
    "--disable-rofiles-fuse",
    "--install-deps-from=flathub",
    "--force-clean",
    "--stop-at=bootc-buddy",
    buildDir,
    manifest,
  ],
  { stdio: "inherit" },
);

if (buildStatus.status !== 0) {
  process.exit(buildStatus.status ?? 1);
}

const devProcess = spawn(
  "flatpak",
  [
    "run",
    "--command=flatpak-builder",
    "org.flatpak.Builder",
    "--run",
    "--share=network",
    buildDir,
    manifest,
    "env",
    `COREPACK_HOME=${corepackHome}`,
    `PNPM_HOME=${pnpmHome}`,
    "corepack",
    "pnpm",
    "exec",
    "gtkx",
    "dev",
    "src/dev.tsx",
  ],
  { stdio: "inherit" },
);

const stopDevProcess = (): boolean => devProcess.kill("SIGTERM");

process.once("SIGINT", stopDevProcess);
process.once("SIGTERM", stopDevProcess);
process.once("SIGHUP", stopDevProcess);

const devStatus = await new Promise<number>((resolve, reject): void => {
  devProcess.once("error", reject);
  devProcess.once("close", (code): void => resolve(code ?? 1));
}).finally(async (): Promise<void> => {
  process.off("SIGINT", stopDevProcess);
  process.off("SIGTERM", stopDevProcess);
  process.off("SIGHUP", stopDevProcess);
  await cleanupRofiles();
});

process.exit(devStatus);
