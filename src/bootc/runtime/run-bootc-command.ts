import { t } from "try";
import * as errors from "../errors.ts";
import { type CommandOutput } from "./command-output.ts";
import { runHostCommand } from "./run-host-command.ts";

/**
 * Run a `bootc` command as root through polkit.
 *
 * @throws {Deno.errors.NotFound} When `pkexec` or `flatpak-spawn` is missing.
 * @throws {Deno.errors.PermissionDenied} When starting `pkexec` or `flatpak-spawn` is denied.
 * @throws {errors.CommandStartError} When the command cannot be started for another reason.
 * @throws {errors.CommandExitError} When the `pkexec bootc` command exits unsuccessfully.
 */
export async function runBootcCommand(args: readonly string[]): Promise<CommandOutput> {
  const command = ["bootc", ...args];
  const output = await t(() => runHostCommand(["pkexec", ...command]));

  if (!output.ok) {
    throw output.error;
  }

  if (output.value.code !== 0) {
    throw new errors.CommandExitError(
      command,
      output.value.code,
      output.value.stdout,
      output.value.stderr,
    );
  }

  return output.value;
}
