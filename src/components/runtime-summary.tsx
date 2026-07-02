import { type ReactNode } from "react";
import { StatusBlock } from "./status-block.tsx";

/**
 * State for the manual runtime capability check.
 */
export type RuntimeViewState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading" }
  | { readonly kind: "loaded"; readonly valid: boolean }
  | { readonly kind: "crashed"; readonly error: unknown };

type RuntimeSummaryProps = {
  readonly state: RuntimeViewState;
};

/**
 * Displays the manual runtime capability check result.
 *
 * @param props Runtime summary props.
 * @returns The runtime summary.
 */
export function RuntimeSummary(props: RuntimeSummaryProps): ReactNode {
  if (props.state.kind === "idle") {
    return (
      <StatusBlock
        title="Runtime check"
        tone="neutral"
        compact
        body="Not checked yet. Use Check runtime to verify host command access."
      />
    );
  }

  if (props.state.kind === "loading") {
    return (
      <StatusBlock
        title="Runtime check"
        tone="neutral"
        compact
        body="Checking flatpak-spawn host access, pkexec, and bootc..."
      />
    );
  }

  if (props.state.kind === "crashed") {
    return (
      <StatusBlock
        title="Runtime check crashed"
        tone="error"
        body={formatUnknownError(props.state.error)}
      />
    );
  }

  return (
    <StatusBlock
      title={props.state.valid ? "Runtime check: valid" : "Runtime check: invalid"}
      tone={props.state.valid ? "ok" : "error"}
      compact
      body={
        props.state.valid
          ? "This runtime can execute the host commands needed for bootc."
          : "This runtime cannot execute one or more required host commands. isValidRuntime() returned false."
      }
    />
  );
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\n${error.stack ?? "No stack trace available."}`;
  }

  return safeStringify(error);
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
