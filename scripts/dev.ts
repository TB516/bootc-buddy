const buildDir = ".flatpak-build";
const manifest = "build-aux/flatpak/io.github.TB516.BootcBuddy.yml";
const denoDir = `${Deno.cwd()}/${buildDir}/deno-cache`;
const flatpakBuilder = ["run", "--command=flatpak-builder", "org.flatpak.Builder"];

async function cleanupRofiles() {
  try {
    for await (const entry of Deno.readDir(".flatpak-builder/rofiles")) {
      await new Deno.Command("fusermount3", {
        args: ["-uz", `.flatpak-builder/rofiles/${entry.name}`],
        stdout: "null",
        stderr: "null",
      }).spawn().status;
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  try {
    await Deno.remove(".flatpak-builder/rofiles", { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

await cleanupRofiles();

await Deno.mkdir(buildDir, { recursive: true });
await Deno.mkdir(denoDir, { recursive: true });

const buildStatus = await new Deno.Command("flatpak", {
  args: [
    ...flatpakBuilder,
    "--system",
    "--assumeyes",
    "--disable-rofiles-fuse",
    "--install-deps-from=flathub",
    "--force-clean",
    "--stop-at=bootc-buddy",
    buildDir,
    manifest,
  ],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
}).spawn().status;

if (!buildStatus.success) {
  Deno.exit(buildStatus.code);
}

const devProcess = new Deno.Command("flatpak", {
  args: [
    ...flatpakBuilder,
    "--run",
    buildDir,
    manifest,
    "env",
    `DENO_DIR=${denoDir}`,
    "deno",
    "run",
    "-A",
    "@gtkx/cli",
    "dev",
    "src/dev.tsx",
  ],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
}).spawn();

let shuttingDown = false;
const stopDevProcess = () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  try {
    devProcess.kill("SIGTERM");
  } catch {
    // The process may already have exited.
  }
};

Deno.addSignalListener("SIGINT", stopDevProcess);
Deno.addSignalListener("SIGTERM", stopDevProcess);
Deno.addSignalListener("SIGHUP", stopDevProcess);

let devStatus: Deno.CommandStatus;
try {
  devStatus = await devProcess.status;
} finally {
  Deno.removeSignalListener("SIGINT", stopDevProcess);
  Deno.removeSignalListener("SIGTERM", stopDevProcess);
  Deno.removeSignalListener("SIGHUP", stopDevProcess);
  await cleanupRofiles();
}

if (!devStatus.success) {
  Deno.exit(devStatus.code);
}
