import { Effect, Schema } from "effect";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import {
  BootcInvalidResponseError,
  CommandExitError,
  CommandNotFoundError,
  CommandPermissionDeniedError,
  CommandStartError,
} from "../errors.ts";
import { runBootcCommand } from "../runtime/run-bootc-command.ts";
import { type BootcStatus, bootcStatusSchema } from "../schemas/status.ts";

/**
 * Read the current `bootc` status from the host system.
 *
 * The command runs as root through `pkexec bootc status --format=json`, then
 * parses the JSON output into the application status schema.
 */
export const getBootcStatus: Effect.Effect<
  BootcStatus,
  | BootcInvalidResponseError
  | CommandExitError
  | CommandNotFoundError
  | CommandPermissionDeniedError
  | CommandStartError,
  ChildProcessSpawner.ChildProcessSpawner
> = Effect.gen(function* () {
  const output = yield* runBootcCommand(["status", "--format=json"]);

  const parsed = yield* Effect.try({
    try: (): unknown => JSON.parse(output.stdout) as unknown,
    catch: (cause): BootcInvalidResponseError =>
      new BootcInvalidResponseError({
        message: "bootc status --format=json returned invalid JSON",
        cause,
      }),
  });

  return yield* Schema.decodeUnknownEffect(bootcStatusSchema)(parsed).pipe(
    Effect.mapError(
      (cause): BootcInvalidResponseError =>
        new BootcInvalidResponseError({
          message: "bootc status --format=json returned an unexpected response shape",
          cause,
        }),
    ),
  );
});
