const buildDir = ".flatpak-build-release";
const manifest = "build-aux/flatpak/io.github.TB516.BootcBuddy.yml";
const flatpakBuilder = ["run", "--command=flatpak-builder", "org.flatpak.Builder"];
const legacyDevCache = ".flatpak-builder/build/bootc-buddy/.flatpak-deno-cache";

try {
  await Deno.remove(legacyDevCache, { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}

const status = await new Deno.Command("flatpak", {
  args: [
    ...flatpakBuilder,
    "--system",
    "--assumeyes",
    "--disable-rofiles-fuse",
    "--delete-build-dirs",
    "--install-deps-from=flathub",
    "--force-clean",
    buildDir,
    manifest,
  ],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
}).spawn().status;

if (!status.success) {
  Deno.exit(status.code);
}
