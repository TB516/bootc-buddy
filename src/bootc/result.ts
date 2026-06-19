/**
 * Public error details returned by bootc command wrappers.
 */
export interface BootcCommandError {
  /** Stable error name, usually the internal Effect tagged error name. */
  readonly name: string;
  /** Human-readable error message suitable for display or logs. */
  readonly message: string;
  /** Original lower-level cause when one is available. */
  readonly cause?: unknown;
}

/**
 * Public result shape returned by bootc command wrappers.
 *
 * Successful results carry a command-specific body. Expected command failures
 * should be returned as an error result instead of being thrown to callers.
 */
export type BootcCommandResult<Body> =
  | {
    readonly ok: true;
    readonly body: Body;
    readonly message?: string;
    readonly error?: undefined;
  }
  | {
    readonly ok: false;
    readonly body?: undefined;
    readonly message: string;
    readonly error: BootcCommandError;
  };
