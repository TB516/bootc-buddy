import { Effect } from "effect";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import {
  CommandNotFoundError,
  CommandPermissionDeniedError,
  CommandStartError,
} from "../errors.ts";
import { nodeProcessLayer } from "./node-process-layer.ts";
import {
  type CommandOutput,
  type HostCommandArgs,
  runHostCommandEffect,
} from "./run-host-command.ts";

let validRuntime: Promise<boolean> | undefined;

/**
 * Check whether the app can run the host commands needed for `bootc`.
 *
 * The first call validates that host command execution works through
 * `flatpak-spawn --host`, that `pkexec` exists and can be called, and that
 * `bootc` exists and can be called. The boolean result is cached for future calls.
 *
 * @returns Whether the current runtime can execute the required host commands.
 */
export function isValidRuntime(): Promise<boolean> {
  validRuntime ??= Effect.runPromise(
    isValidRuntimeEffect().pipe(Effect.provide(nodeProcessLayer)),
  );
  return validRuntime;
}

export function isValidRuntimeEffect(): Effect.Effect<
  boolean,
  never,
  ChildProcessSpawner.ChildProcessSpawner
> {
  return Effect.gen(function* () {
    const checks: readonly HostCommandArgs[] = [
      ["true"],
      ["pkexec", "--version"],
      ["bootc", "--version"],
    ];

    for (const args of checks) {
      const succeeded = yield* commandStartedAndExitedZero(args);
      if (!succeeded) {
        return false;
      }
    }

    return true;
  });
}

function commandStartedAndExitedZero(
  args: HostCommandArgs,
): Effect.Effect<boolean, never, ChildProcessSpawner.ChildProcessSpawner> {
  return runHostCommandEffect(args).pipe(
    Effect.map((output: CommandOutput): boolean => output.code === 0),
    Effect.catchTags({
      CommandNotFoundError: (_error: CommandNotFoundError) => Effect.succeed(false),
      CommandPermissionDeniedError: (_error: CommandPermissionDeniedError) =>
        Effect.succeed(false),
      CommandStartError: (_error: CommandStartError) => Effect.succeed(false),
    }),
  );
}
