import { Data } from "effect";

/**
 * The process runtime could not find the executable to start.
 *
 * @ignore Internal cross-file error type; not part of the public bootc API.
 */
export class CommandNotFoundError extends Data.TaggedError("CommandNotFoundError")<{
  readonly command: readonly string[];
  readonly executable: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The process runtime was denied permission to start the executable.
 *
 * @ignore Internal cross-file error type; not part of the public bootc API.
 */
export class CommandPermissionDeniedError extends Data.TaggedError("CommandPermissionDeniedError")<{
  readonly command: readonly string[];
  readonly executable: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The executable failed to start for a reason other than missing file or permission denial.
 *
 * @ignore Internal cross-file error type; not part of the public bootc API.
 */
export class CommandStartError extends Data.TaggedError("CommandStartError")<{
  readonly command: readonly string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The command started but exited with a non-zero status code.
 *
 * @ignore Internal cross-file error type; not part of the public bootc API.
 */
export class CommandExitError extends Data.TaggedError("CommandExitError")<{
  readonly command: readonly string[];
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * bootc returned JSON that could not be parsed or did not match the expected schema.
 *
 * @ignore Internal cross-file error type; not part of the public bootc API.
 */
export class BootcInvalidResponseError extends Data.TaggedError("BootcInvalidResponseError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
