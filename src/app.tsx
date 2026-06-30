import { type ReactNode } from "react";
import { BootcStatusProvider } from "./context/bootc-status.tsx";
import { MainPage } from "./pages/main.tsx";

/**
 * Root GTKX application component.
 *
 * @returns The GTKX application tree.
 */
export function App(): ReactNode {
  return (
    <BootcStatusProvider>
      <MainPage />
    </BootcStatusProvider>
  );
}
