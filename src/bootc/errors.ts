/** Error thrown when a command cannot be started for a non-standard reason. */
export class CommandStartError extends Error {
  /** Wrapped underlying cause. */
  override readonly cause?: unknown;
  /** Command that could not be started. */
  readonly command: readonly string[];

  constructor(
    command: readonly string[],
    cause?: unknown,
  ) {
    super(`${command.join(" ")} could not be started`, { cause });
    this.name = "CommandStartError";
    this.cause = cause;
    this.command = command;
  }
}

/** Error thrown when a command exits unsuccessfully. */
export class CommandExitError extends Error {
  /** Wrapped underlying cause. */
  override readonly cause?: unknown;
  /** Command that exited unsuccessfully. */
  readonly command: readonly string[];
  /** Process exit code. */
  readonly code: number;
  /** Trimmed standard output. */
  readonly stdout: string;
  /** Trimmed standard error. */
  readonly stderr: string;

  constructor(
    command: readonly string[],
    code: number,
    stdout: string,
    stderr: string,
    cause?: unknown,
  ) {
    super(
      `${command.join(" ")} failed with exit code ${code}: ${stderr || stdout || "no output"}`,
    );
    this.name = "CommandExitError";
    this.cause = cause;
    this.command = command;
    this.code = code;
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

/** Error thrown when bootc returns a response the app cannot use. */
export class BootcInvalidResponseError extends Error {
  /** Wrapped underlying cause. */
  override readonly cause?: unknown;

  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "BootcInvalidResponseError";
    this.cause = cause;
  }
}
