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
 */
export function runBootcCommandEffect(
  args: readonly string[],
): Effect.Effect<
  CommandOutput,
  | CommandExitError
  | CommandNotFoundError
  | CommandPermissionDeniedError
  | CommandStartError,
  ChildProcessSpawner.ChildProcessSpawner
> {
  const command = ["bootc", ...args] as const;

  return Effect.gen(function* () {
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
}
