import { type ReactNode } from "react";
import { type BootcStatus } from "../bootc/mod.ts";
import { StatusBlock } from "./status-block.tsx";

type Deployment = BootcStatus["status"]["booted"];

type DeploymentBlockProps = {
  readonly label: string;
  readonly deployment: Deployment;
};

/**
 * Displays details for one bootc deployment slot.
 *
 * @param props Deployment block props.
 * @returns The deployment block.
 */
export function DeploymentBlock(props: DeploymentBlockProps): ReactNode {
  if (props.deployment === null) {
    return <StatusBlock title={props.label} tone="neutral" body="None reported." />;
  }

  const image = props.deployment.image;
  const rows = [
    `Image: ${image?.image.image ?? "unknown"}`,
    `Transport: ${image?.image.transport ?? "unknown"}`,
    `Digest: ${image?.imageDigest ?? "unknown"}`,
    `Architecture: ${image?.architecture ?? "unknown"}`,
    `Version: ${image?.version ?? "unknown"}`,
    `Timestamp: ${image?.timestamp ?? "unknown"}`,
    `Pinned: ${yesNo(props.deployment.pinned)}`,
    `Incompatible: ${yesNo(props.deployment.incompatible)}`,
    `Soft reboot capable: ${formatMaybeBoolean(props.deployment.softRebootCapable)}`,
    `Cached update: ${props.deployment.cachedUpdate?.image.image ?? "none"}`,
  ];

  return (
    <StatusBlock
      title={props.label}
      tone={props.deployment.incompatible ? "warning" : "neutral"}
      body={rows.join("\n")}
    />
  );
}

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function formatMaybeBoolean(value: boolean | undefined): string {
  return value === undefined ? "unknown" : yesNo(value);
}
