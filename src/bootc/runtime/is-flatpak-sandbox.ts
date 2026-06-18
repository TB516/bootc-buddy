import { t } from "try";

let flatpakSandbox: Promise<boolean> | undefined;

/** Return whether the app is running inside a Flatpak sandbox. */
export function isFlatpakSandbox(): Promise<boolean> {
  flatpakSandbox ??= detectFlatpakSandbox();
  return flatpakSandbox;
}

async function detectFlatpakSandbox(): Promise<boolean> {
  const stat = await t(() => Deno.stat("/.flatpak-info"));

  if (!stat.ok) {
    if (stat.error instanceof Deno.errors.NotFound) {
      return false;
    }

    return true;
  }

  return stat.value.isFile;
}
