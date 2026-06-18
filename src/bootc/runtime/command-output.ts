/** Captured process output from a bootc command. */
export interface CommandOutput {
  /** Process exit code. */
  readonly code: number;
  /** Trimmed standard output. */
  readonly stdout: string;
  /** Trimmed standard error. */
  readonly stderr: string;
}

/** Return usable error output from the CommandOutput. */
export function formatErrorOutput(output: CommandOutput): string {
  return output.stderr || output.stdout || "no output";
}
