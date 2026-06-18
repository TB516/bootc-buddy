import { Result, t } from "try";
import * as errors from "../errors.ts";
import { runHostCommand } from "./run-host-command.ts";

let bootcRuntime: Promise<boolean> | undefined;

/**
 * Lazily check whether the bootc runtime is available.
 *
 * @returns Whether the runtime is available.
 */
export function getBootcRuntime(): Promise<boolean> {
  bootcRuntime ??= detectBootcRuntime();
  return bootcRuntime;
}

async function detectBootcRuntime(): Promise<boolean> {
  const runtime = await t(() => validateBootcRuntime());
  return runtime.ok;
}

/**
 * Validate required host commands.
 *
 * @throws {Deno.errors.NotFound} When a required executable is missing.
 * @throws {Deno.errors.PermissionDenied} When starting a required executable is denied.
 * @throws {errors.CommandStartError} When a required executable cannot be started for another reason.
 * @throws {errors.CommandExitError} When a required command exits unsuccessfully.
 */
async function validateBootcRuntime(): Promise<void> {
  await requireHostCommand(["true"], "flatpak-spawn could not run host commands");
  await requireHostCommand(["pkexec", "--version"], "pkexec is not available");
  await requireHostCommand(["bootc", "--help"], "bootc is not available");
}

/**
 * Require a host command to exit successfully.
 *
 * @throws {Deno.errors.NotFound} When the executable is missing.
 * @throws {Deno.errors.PermissionDenied} When starting the executable is denied.
 * @throws {errors.CommandStartError} When the executable cannot be started for another reason.
 * @throws {errors.CommandExitError} When the command exits unsuccessfully.
 */
async function requireHostCommand(args: readonly string[], message: string): Promise<void> {
  const output = await t(() => runHostCommand(args));

  if (!output.ok) {
    if (output.error instanceof Deno.errors.NotFound) {
      throw new Deno.errors.NotFound(`${message}: ${output.error.message}`);
    }

    if (output.error instanceof Deno.errors.PermissionDenied) {
      throw new Deno.errors.PermissionDenied(`${message}: ${output.error.message}`);
    }

    if (output.error instanceof errors.CommandStartError) {
      throw output.error;
    }

    throw new errors.CommandStartError(args, output.error);
  }

  if (output.value.code !== 0) {
    throw new errors.CommandExitError(
      args,
      output.value.code,
      output.value.stdout,
      output.value.stderr,
    );
  }
}
