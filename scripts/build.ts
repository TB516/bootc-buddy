import { spawnSync } from "node:child_process";

const buildDir = ".flatpak-build-release";
const manifest = "build-aux/flatpak/io.github.TB516.BootcBuddy.yml";
const repoDir = ".flatpak-repo";
const gpgSign = process.env.FLATPAK_GPG_SIGN;

const status = spawnSync(
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
    ...(gpgSign ? [`--repo=${repoDir}`, `--gpg-sign=${gpgSign}`] : []),
    buildDir,
    manifest,
  ],
  { stdio: "inherit" },
);

process.exit(status.status ?? 1);
