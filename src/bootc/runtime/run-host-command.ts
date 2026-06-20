import { Effect, Stream } from "effect";
import type * as PlatformError from "effect/PlatformError";
import * as ChildProcess from "effect/unstable/process/ChildProcess";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import {
  CommandNotFoundError,
  CommandPermissionDeniedError,
  CommandStartError,
} from "../errors.ts";

const textDecoder = new TextDecoder();

export type HostCommand = "true" | "bootc" | "pkexec";

export type HostCommandArgs = readonly [HostCommand, ...string[]];

export interface CommandOutput {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * Run a host command through Flatpak and capture its exit code, stdout, and stderr.
 *
 * @param args The host command and arguments to pass after `flatpak-spawn --host`.
 * @returns An Effect that starts the command and captures its output.
 */
export function runHostCommandEffect(
  args: HostCommandArgs,
): Effect.Effect<
  CommandOutput,
  CommandNotFoundError | CommandPermissionDeniedError | CommandStartError,
  ChildProcessSpawner.ChildProcessSpawner
> {
  const command = ["flatpak-spawn", "--host", ...args] as const;

  return Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make("flatpak-spawn", ["--host", ...args], {
        stdin: "ignore",
        stdout: "pipe",
        stderr: "pipe",
      });

      const [exitCode, stdout, stderr] = yield* Effect.all(
        [handle.exitCode, collectOutput(handle.stdout), collectOutput(handle.stderr)],
        { concurrency: "unbounded" },
      );

      return {
        code: Number(exitCode),
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    }),
  ).pipe(Effect.mapError((cause) => commandStartError(command, cause)));
}

function collectOutput(
  stream: Stream.Stream<Uint8Array, PlatformError.PlatformError>,
): Effect.Effect<string, PlatformError.PlatformError> {
  return Stream.runCollect(stream).pipe(Effect.map(decodeChunks));
}

function decodeChunks(chunks: ReadonlyArray<Uint8Array>): string {
  return textDecoder.decode(Buffer.concat(chunks));
}

function commandStartError(
  command: readonly string[],
  cause: PlatformError.PlatformError,
): CommandNotFoundError | CommandPermissionDeniedError | CommandStartError {
  if (cause.reason._tag === "NotFound") {
    return new CommandNotFoundError({
      command,
      executable: command[0] ?? "",
      message: `${command[0] ?? "command"} is not available`,
      cause,
    });
  }

  if (cause.reason._tag === "PermissionDenied") {
    return new CommandPermissionDeniedError({
      command,
      executable: command[0] ?? "",
      message: `${command[0] ?? "command"} could not be started`,
      cause,
    });
  }

  return new CommandStartError({
    command,
    message: `${command.join(" ")} could not be started`,
    cause,
  });
}
