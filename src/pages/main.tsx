import { type ReactNode, useState } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import {
  GtkApplicationWindow,
  GtkBox,
  GtkLabel,
  GtkScrolledWindow,
  GtkSeparator,
  quit,
} from "@gtkx/react";
import { readRuntimeValidity } from "../bootc/mod.ts";
import { AppHeader } from "../components/app-header.tsx";
import { BootcStatusSummary } from "../components/bootc-status-summary.tsx";
import { RuntimeSummary, type RuntimeViewState } from "../components/runtime-summary.tsx";
import { useBootcStatus } from "../context/bootc-status.tsx";

/**
 * Main application screen.
 *
 * @returns The main Bootc Buddy UI.
 */
export function MainPage(): ReactNode {
  const bootcStatus = useBootcStatus();
  const [runtimeState, setRuntimeState] = useState<RuntimeViewState>({ kind: "idle" });

  const checkRuntime = async (): Promise<void> => {
    setRuntimeState({ kind: "loading" });

    try {
      setRuntimeState({ kind: "loaded", valid: await readRuntimeValidity() });
    } catch (error) {
      setRuntimeState({ kind: "crashed", error });
    }
  };

  const refreshStatus = (): void => {
    void bootcStatus.refreshStatus();
  };

  const checkRuntimeStatus = (): void => {
    void checkRuntime();
  };

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
        <AppHeader
          isStatusLoading={bootcStatus.state === "loading"}
          isRuntimeLoading={runtimeState.kind === "loading"}
          onRefreshStatus={refreshStatus}
          onCheckRuntime={checkRuntimeStatus}
        />

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
            <BootcStatusSummary status={bootcStatus} />
          </GtkBox>
        </GtkScrolledWindow>
      </GtkBox>
    </GtkApplicationWindow>
  );
}
