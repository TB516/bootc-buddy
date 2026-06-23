import { spawnSync } from "node:child_process";

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
    ".flatpak-build-release",
    "build-aux/flatpak/io.github.TB516.BootcBuddy.yml",
  ],
  { stdio: "inherit" },
);

process.exit(status.status ?? 1);
