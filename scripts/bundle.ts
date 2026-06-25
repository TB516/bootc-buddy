import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

const appId = "io.github.TB516.BootcBuddy";
const buildDir = ".flatpak-build-bundle";
const manifest = "build-aux/flatpak/io.github.TB516.BootcBuddy.yml";
const repoDir = ".flatpak-repo";
const bundleDir = "bin";
const bundlePath = `${bundleDir}/bootc-buddy.flatpak`;

await mkdir(bundleDir, { recursive: true });
await rm(bundlePath, { force: true });

const buildStatus = spawnSync(
  "flatpak",
  [
    "run",
    "--command=flatpak-builder",
    "org.flatpak.Builder",
    "--system",
    "--assumeyes",
    "--disable-rofiles-fuse",
    "--delete-build-dirs",
    "--install-deps-from=flathub",
    "--force-clean",
    `--repo=${repoDir}`,
    buildDir,
    manifest,
  ],
  { stdio: "inherit" },
);

if (buildStatus.status !== 0) {
  process.exit(buildStatus.status ?? 1);
}

const bundleStatus = spawnSync(
  "flatpak",
  ["build-bundle", repoDir, bundlePath, appId, "master"],
  { stdio: "inherit" },
);

process.exit(bundleStatus.status ?? 1);
