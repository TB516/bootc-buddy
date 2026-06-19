import { Effect, Schema } from "effect";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import {
  BootcInvalidResponseError,
  CommandExitError,
  CommandNotFoundError,
  CommandPermissionDeniedError,
  CommandStartError,
} from "../errors.ts";
import { type BootcCommandResult } from "../result.ts";
import { runBootcCommandEffect } from "../runtime/run-bootc-command.ts";
import { nodeProcessLayer } from "../runtime/node-process-layer.ts";
import { type BootcStatus, bootcStatusSchema } from "../schemas/status.ts";

/**
 * Read the current bootc host status.
 *
 * Runs `bootc status --format=json`, parses the returned JSON, and validates
 * it against the expected status schema.
 *
 * @returns A result containing the parsed and validated bootc status response,
 * or public error details when an expected command failure occurs.
 */
export async function getBootcStatus(): Promise<BootcCommandResult<BootcStatus>> {
  return await Effect.runPromise(
    getBootcStatusEffect().pipe(
      Effect.match({
        onFailure: (cause): BootcCommandResult<BootcStatus> => ({
          ok: false,
          message: cause.message,
          error: {
            name: cause._tag,
            message: cause.message,
            cause,
          },
        }),
        onSuccess: (body): BootcCommandResult<BootcStatus> => ({
          ok: true,
          body,
        }),
      }),
      Effect.provide(nodeProcessLayer),
    ),
  );
}

export function getBootcStatusEffect(): Effect.Effect<
  BootcStatus,
  | BootcInvalidResponseError
  | CommandExitError
  | CommandNotFoundError
  | CommandPermissionDeniedError
  | CommandStartError,
  ChildProcessSpawner.ChildProcessSpawner
> {
  return Effect.gen(function* () {
    const output = yield* runBootcCommandEffect(["status", "--format=json"]);

    const parsed = yield* Effect.try({
      try: (): unknown => JSON.parse(output.stdout) as unknown,
      catch: (cause): BootcInvalidResponseError =>
        new BootcInvalidResponseError({
          message: "bootc status --format=json returned invalid JSON",
          cause,
        }),
    });

    return yield* Schema.decodeUnknownEffect(bootcStatusSchema)(parsed).pipe(
      Effect.mapError((cause) =>
        new BootcInvalidResponseError({
          message: "bootc status --format=json returned an unexpected response shape",
          cause,
        })
      ),
    );
  });
}
