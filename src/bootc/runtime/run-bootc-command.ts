import { Effect } from "effect";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import {
  CommandExitError,
  CommandNotFoundError,
  CommandPermissionDeniedError,
  CommandStartError,
} from "../errors.ts";
import { type CommandOutput, runHostCommandEffect } from "./run-host-command.ts";

/**
 * Run a `bootc` command as root through `pkexec`.
 *
 * The provided arguments are appended after `bootc`, so an empty argument list
 * runs `pkexec bootc`. Successful commands return the captured exit code,
 * stdout, and stderr from the host command.
 *
 * @param args The arguments to pass to `bootc`.
 * @returns An Effect that captures successful command output or fails with a command error.
 */
export const runBootcCommandEffect = (
  args: readonly string[],
): Effect.Effect<
  CommandOutput,
  CommandExitError | CommandNotFoundError | CommandPermissionDeniedError | CommandStartError,
  ChildProcessSpawner.ChildProcessSpawner
> =>
  Effect.gen(function* () {
    const command = ["bootc", ...args] as const;
    const output = yield* runHostCommandEffect(["pkexec", ...command]);

    if (output.code !== 0) {
      return yield* new CommandExitError({
        command,
        code: output.code,
        stdout: output.stdout,
        stderr: output.stderr,
        message: `${command.join(" ")} failed with exit code ${output.code}: ${
          output.stderr || output.stdout || "no output"
        }`,
      });
    }

    return output;
  });
