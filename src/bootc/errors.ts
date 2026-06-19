import { Data } from "effect";

/**
 * Raised when the process runtime cannot find the executable to start.
 *
 * @internal
 */
export class CommandNotFoundError extends Data.TaggedError("CommandNotFoundError")<{
  readonly command: readonly string[];
  readonly executable: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Raised when the process runtime is denied permission to start the executable.
 *
 * @internal
 */
export class CommandPermissionDeniedError extends Data.TaggedError("CommandPermissionDeniedError")<{
  readonly command: readonly string[];
  readonly executable: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Raised when an executable fails to start for a reason other than a missing
 * executable or permission denial.
 *
 * @internal
 */
export class CommandStartError extends Data.TaggedError("CommandStartError")<{
  readonly command: readonly string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Raised when a command starts successfully but exits with a non-zero status
 * code.
 *
 * @internal
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
 * Raised when bootc returns JSON that cannot be parsed or does not match the
 * expected schema.
 *
 * @internal
 */
export class BootcInvalidResponseError extends Data.TaggedError("BootcInvalidResponseError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
