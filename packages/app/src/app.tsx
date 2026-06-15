import React, { useState } from "react";
import * as Gtk from "@gtkx/ffi/gtk";
import { GtkApplicationWindow, GtkBox, GtkButton, GtkLabel, quit } from "@gtkx/react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <GtkApplicationWindow
      title="Bootc Buddy"
      defaultWidth={520}
      defaultHeight={360}
      onClose={quit}
    >
      <GtkBox
        orientation={Gtk.Orientation.VERTICAL}
        spacing={16}
        marginTop={32}
        marginBottom={32}
        marginStart={32}
        marginEnd={32}
      >
        <GtkLabel label="Bootc Buddy" cssClasses={["title-1"]} />
        <GtkLabel label="GTKX is running through Deno with Vite HMR enabled." />
        <GtkButton
          label={`GTKX counter: ${count}`}
          onClicked={() => setCount((value: number) => value + 1)}
        />
      </GtkBox>
    </GtkApplicationWindow>
  );
}
