import { type ReactNode } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import { GtkBox, GtkButton, GtkLabel } from "@gtkx/react";

type AppHeaderProps = {
  readonly isStatusLoading: boolean;
  readonly isRuntimeLoading: boolean;
  readonly onRefreshStatus: () => void;
  readonly onCheckRuntime: () => void;
};

/**
 * Displays the app title and top-level actions.
 *
 * @param props App header props.
 * @returns The app header.
 */
export function AppHeader(props: AppHeaderProps): ReactNode {
  return (
    <GtkBox orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
      <GtkLabel
        label="Bootc Buddy"
        cssClasses={["title-1"]}
        halign={Gtk.Align.START}
        hexpand
        xalign={0}
      />
      <GtkButton
        label={props.isStatusLoading ? "Checking..." : "Refresh status"}
        sensitive={!props.isStatusLoading}
        onClicked={props.onRefreshStatus}
      />
      <GtkButton
        label={props.isRuntimeLoading ? "Checking..." : "Check runtime"}
        sensitive={!props.isRuntimeLoading}
        onClicked={props.onCheckRuntime}
      />
    </GtkBox>
  );
}
