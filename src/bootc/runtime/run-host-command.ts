import { t } from "try";
import * as errors from "../errors.ts";
import { type CommandOutput } from "./command-output.ts";
import { isFlatpakSandbox } from "./is-flatpak-sandbox.ts";

const textDecoder = new TextDecoder();

/**
 * Run a command locally or through `flatpak-spawn --host` when sandboxed.
 *
 * @throws {TypeError} When the command is empty.
 * @throws {Deno.errors.NotFound} When the executable is missing.
 * @throws {Deno.errors.PermissionDenied} When starting the executable is denied.
 * @throws {errors.CommandStartError} When the executable cannot be started for another reason.
 */
export async function runHostCommand(args: readonly string[]): Promise<CommandOutput> {
  const command = await isFlatpakSandbox() ? ["flatpak-spawn", "--host", ...args] : [...args];
  const [executable, ...commandArgs] = command;

  if (!executable) {
    throw new TypeError("cannot run an empty command");
  }

  const output = await t(() =>
    new Deno.Command(executable, {
      args: commandArgs,
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    }).output()
  );

  if (!output.ok) {
    if (output.error instanceof Deno.errors.NotFound) {
      throw new Deno.errors.NotFound(`${executable} is not available`);
    }

    if (output.error instanceof Deno.errors.PermissionDenied) {
      throw new Deno.errors.PermissionDenied(`${executable} could not be started`);
    }

    throw new errors.CommandStartError(command, output.error);
  }

  return {
    code: output.value.code,
    stdout: textDecoder.decode(output.value.stdout).trim(),
    stderr: textDecoder.decode(output.value.stderr).trim(),
  };
}
