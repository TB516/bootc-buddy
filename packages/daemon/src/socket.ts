/** Socket filename used by the bootc-buddy daemon. */
export const SOCKET_NAME = "bootc-buddy-daemon.sock";

/** Returns the daemon socket path inside XDG_RUNTIME_DIR. */
export function getSocketPath(): string {
  const runtimeDir = Deno.env.get("XDG_RUNTIME_DIR");

  if (!runtimeDir) {
    throw new Error("XDG_RUNTIME_DIR must be set to start the daemon");
  }

  return `${runtimeDir}/${SOCKET_NAME}`;
}
