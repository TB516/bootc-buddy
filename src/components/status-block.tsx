import { type ReactNode } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import { GtkBox, GtkLabel } from "@gtkx/react";

/**
 * Visual tone used to style a status block heading.
 */
export type StatusBlockTone = "ok" | "warning" | "error" | "neutral";

type StatusBlockProps = {
  readonly title: string;
  readonly body: string;
  readonly tone: StatusBlockTone;
  readonly compact?: boolean;
};

/**
 * Displays a titled status block with selectable body text.
 *
 * @param props Status block props.
 * @returns The status block component.
 */
export function StatusBlock(props: StatusBlockProps): ReactNode {
  const { title, body, tone, compact = false } = props;

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
