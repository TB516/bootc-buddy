import { type ReactNode } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import { GtkBox, GtkLabel } from "@gtkx/react";
import { type BootcStatus } from "../bootc/mod.ts";
import { type BootcStatusSnapshot } from "../context/bootc-status.tsx";
import { DeploymentBlock } from "./deployment-block.tsx";
import { StatusBlock } from "./status-block.tsx";

type BootcStatusSummaryProps = {
  readonly status: BootcStatusSnapshot;
};

/**
 * Displays the current `bootc status` snapshot.
 *
 * @param props Bootc status summary props.
 * @returns The bootc status summary.
 */
export function BootcStatusSummary(props: BootcStatusSummaryProps): ReactNode {
  const { status } = props;

  if (status.state === "loading") {
    return (
      <GtkLabel
        label="Running bootc status --format=json..."
        cssClasses={["dim-label"]}
        halign={Gtk.Align.START}
        xalign={0}
      />
    );
  }

  if (status.state === "error") {
    return (
      <StatusBlock
        title={`bootc status failed: ${status.error._tag}`}
        tone="error"
        body={safeStringify(status.error)}
      />
    );
  }

  const bootcStatus = status.data;
  const summary = [
    `Host: ${bootcStatus.metadata.name ?? "unknown"}`,
    `Requested image: ${formatSpecImage(bootcStatus)}`,
    `Boot order: ${bootcStatus.spec.bootOrder ?? "default"}`,
    `Rollback queued: ${yesNo(bootcStatus.status.rollbackQueued)}`,
    `Usr overlay: ${formatOverlay(bootcStatus.status.usrOverlay ?? null)}`,
  ];

  return (
    <GtkBox orientation={Gtk.Orientation.VERTICAL} spacing={12} hexpand vexpand>
      <StatusBlock title="Status" tone="ok" body={summary.join("\n")} />

      <DeploymentBlock label="Booted deployment" deployment={bootcStatus.status.booted} />
      <DeploymentBlock label="Staged deployment" deployment={bootcStatus.status.staged} />
      <DeploymentBlock label="Rollback deployment" deployment={bootcStatus.status.rollback} />

      <StatusBlock title="Raw bootc JSON" tone="neutral" body={safeStringify(bootcStatus)} />
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

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
