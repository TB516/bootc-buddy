import { type ReactNode, useEffect, useState } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import {
  GtkApplicationWindow,
  GtkBox,
  GtkButton,
  GtkLabel,
  GtkScrolledWindow,
  GtkSeparator,
  quit,
} from "@gtkx/react";
import {
  type BootcCommandResult,
  type BootcStatus,
  getBootcStatus,
  isValidRuntime,
} from "./bootc/mod.ts";

type StatusViewState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading" }
  | { readonly kind: "loaded"; readonly result: BootcCommandResult<BootcStatus> }
  | { readonly kind: "crashed"; readonly error: unknown };

type RuntimeViewState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading" }
  | { readonly kind: "loaded"; readonly valid: boolean }
  | { readonly kind: "crashed"; readonly error: unknown };

/**
 * Root GTKX application component.
 *
 * @returns The GTKX application tree.
 */
export function App(): ReactNode {
  const [state, setState] = useState<StatusViewState>({ kind: "idle" });
  const [runtimeState, setRuntimeState] = useState<RuntimeViewState>({ kind: "idle" });

  const refreshStatus = async (): Promise<void> => {
    setState({ kind: "loading" });

    try {
      setState({ kind: "loaded", result: await getBootcStatus() });
    } catch (error) {
      setState({ kind: "crashed", error });
    }
  };

  const checkRuntime = async (): Promise<void> => {
    setRuntimeState({ kind: "loading" });

    try {
      setRuntimeState({ kind: "loaded", valid: await isValidRuntime() });
    } catch (error) {
      setRuntimeState({ kind: "crashed", error });
    }
  };

  useEffect((): (() => void) => {
    let mounted = true;

    setState({ kind: "loading" });
    getBootcStatus()
      .then((result): void => {
        if (mounted) {
          setState({ kind: "loaded", result });
        }
      })
      .catch((error: unknown): void => {
        if (mounted) {
          setState({ kind: "crashed", error });
        }
      });

    return (): void => {
      mounted = false;
    };
  }, []);

  return (
    <GtkApplicationWindow title="Bootc Buddy" defaultWidth={760} defaultHeight={620} onClose={quit}>
      <GtkBox
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
        marginTop={24}
        marginBottom={24}
        marginStart={24}
        marginEnd={24}
      >
        <GtkBox orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
          <GtkLabel
            label="Bootc Buddy"
            cssClasses={["title-1"]}
            halign={Gtk.Align.START}
            hexpand
            xalign={0}
          />
          <GtkButton
            label={state.kind === "loading" ? "Checking..." : "Refresh status"}
            sensitive={state.kind !== "loading"}
            onClicked={(): void => {
              void refreshStatus();
            }}
          />
          <GtkButton
            label={runtimeState.kind === "loading" ? "Checking..." : "Check runtime"}
            sensitive={runtimeState.kind !== "loading"}
            onClicked={(): void => {
              void checkRuntime();
            }}
          />
        </GtkBox>

        <GtkLabel
          label="Temporary bootc status test view"
          cssClasses={["dim-label"]}
          halign={Gtk.Align.START}
          xalign={0}
        />

        <GtkSeparator orientation={Gtk.Orientation.HORIZONTAL} />

        <GtkScrolledWindow vexpand hexpand>
          <GtkBox orientation={Gtk.Orientation.VERTICAL} spacing={12} hexpand>
            <RuntimeSummary state={runtimeState} />
            <StatusSummary state={state} />
          </GtkBox>
        </GtkScrolledWindow>
      </GtkBox>
    </GtkApplicationWindow>
  );
}

function RuntimeSummary({ state }: { readonly state: RuntimeViewState }): ReactNode {
  if (state.kind === "idle") {
    return (
      <StatusBlock
        title="Runtime check"
        tone="neutral"
        compact
        body="Not checked yet. Use Check runtime to verify host command access."
      />
    );
  }

  if (state.kind === "loading") {
    return (
      <StatusBlock
        title="Runtime check"
        tone="neutral"
        compact
        body="Checking flatpak-spawn host access, pkexec, and bootc..."
      />
    );
  }

  if (state.kind === "crashed") {
    return (
      <StatusBlock
        title="Runtime check crashed"
        tone="error"
        body={formatUnknownError(state.error)}
      />
    );
  }

  return (
    <StatusBlock
      title={state.valid ? "Runtime check: valid" : "Runtime check: invalid"}
      tone={state.valid ? "ok" : "error"}
      compact
      body={
        state.valid
          ? "This runtime can execute the host commands needed for bootc."
          : "This runtime cannot execute one or more required host commands. isValidRuntime() returned false."
      }
    />
  );
}

function StatusSummary({ state }: { readonly state: StatusViewState }): ReactNode {
  if (state.kind === "idle" || state.kind === "loading") {
    return (
      <GtkLabel
        label={
          state.kind === "loading" ? "Running bootc status --format=json..." : "Not checked yet."
        }
        cssClasses={["dim-label"]}
        halign={Gtk.Align.START}
        xalign={0}
      />
    );
  }

  if (state.kind === "crashed") {
    return (
      <StatusBlock
        title="Unexpected UI error"
        tone="error"
        body={formatUnknownError(state.error)}
      />
    );
  }

  if (!state.result.ok) {
    return (
      <StatusBlock
        title={`bootc status failed: ${state.result.error.name}`}
        tone="error"
        body={[state.result.message, "", "Error details:", safeStringify(state.result.error)].join(
          "\n",
        )}
      />
    );
  }

  const status = state.result.body;
  const summary = [
    `Host: ${status.metadata.name ?? "unknown"}`,
    `Requested image: ${formatSpecImage(status)}`,
    `Boot order: ${status.spec.bootOrder ?? "default"}`,
    `Rollback queued: ${yesNo(status.status.rollbackQueued)}`,
    `Usr overlay: ${formatOverlay(status.status.usrOverlay ?? null)}`,
  ];

  return (
    <GtkBox orientation={Gtk.Orientation.VERTICAL} spacing={12} hexpand vexpand>
      <StatusBlock title="Status" tone="ok" body={summary.join("\n")} />

      <DeploymentBlock label="Booted deployment" deployment={status.status.booted} />
      <DeploymentBlock label="Staged deployment" deployment={status.status.staged} />
      <DeploymentBlock label="Rollback deployment" deployment={status.status.rollback} />

      <StatusBlock title="Raw bootc JSON" tone="neutral" body={safeStringify(status)} />
    </GtkBox>
  );
}

function DeploymentBlock({
  label,
  deployment,
}: {
  readonly label: string;
  readonly deployment: BootcStatus["status"]["booted"];
}): ReactNode {
  if (deployment === null) {
    return <StatusBlock title={label} tone="neutral" body="None reported." />;
  }

  const image = deployment.image;
  const rows = [
    `Image: ${image?.image.image ?? "unknown"}`,
    `Transport: ${image?.image.transport ?? "unknown"}`,
    `Digest: ${image?.imageDigest ?? "unknown"}`,
    `Architecture: ${image?.architecture ?? "unknown"}`,
    `Version: ${image?.version ?? "unknown"}`,
    `Timestamp: ${image?.timestamp ?? "unknown"}`,
    `Pinned: ${yesNo(deployment.pinned)}`,
    `Incompatible: ${yesNo(deployment.incompatible)}`,
    `Soft reboot capable: ${formatMaybeBoolean(deployment.softRebootCapable)}`,
    `Cached update: ${deployment.cachedUpdate?.image.image ?? "none"}`,
  ];

  return (
    <StatusBlock
      title={label}
      tone={deployment.incompatible ? "warning" : "neutral"}
      body={rows.join("\n")}
    />
  );
}

function StatusBlock({
  title,
  body,
  tone,
  compact = false,
}: {
  readonly title: string;
  readonly body: string;
  readonly tone: "ok" | "warning" | "error" | "neutral";
  readonly compact?: boolean;
}): ReactNode {
  return (
    <GtkBox orientation={Gtk.Orientation.VERTICAL} spacing={6} hexpand>
      <GtkLabel
        label={title}
        cssClasses={[tone === "error" ? "error" : tone === "warning" ? "warning" : "heading"]}
        halign={Gtk.Align.START}
        xalign={0}
      />
      <GtkLabel
        label={body}
        cssClasses={["monospace"]}
        selectable
        wrap
        halign={Gtk.Align.FILL}
        xalign={0}
        yalign={0}
        marginTop={8}
        marginBottom={compact ? 8 : 12}
        marginStart={8}
        marginEnd={8}
        hexpand
      />
    </GtkBox>
  );
}

function formatSpecImage(status: BootcStatus): string {
  if (status.spec.image === null) {
    return "none";
  }

  return `${status.spec.image.transport}:${status.spec.image.image}`;
}

function formatOverlay(overlay: BootcStatus["status"]["usrOverlay"]): string {
  if (overlay === null || overlay === undefined) {
    return "none";
  }

  return `${overlay.accessMode}, ${overlay.persistence}`;
}

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function formatMaybeBoolean(value: boolean | undefined): string {
  return value === undefined ? "unknown" : yesNo(value);
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
