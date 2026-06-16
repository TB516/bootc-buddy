import { app } from "./app.ts";
import { getSocketPath } from "./socket.ts";

async function removeStaleSocket(path: string): Promise<void> {
  try {
    const connection = await Deno.connect({ path, transport: "unix" });
    connection.close();
    throw new Error(`Daemon socket is already in use at ${path}`);
  } catch (error) {
    if (error instanceof Deno.errors.ConnectionRefused) {
      await Deno.remove(path);
      return;
    }

    if (error instanceof Deno.errors.NotFound) {
      return;
    }

    throw error;
  }
}

function normalizeUnixSocketRequest(request: Request): Request {
  const url = new URL(request.url);

  if (url.protocol !== "http+unix:") {
    return request;
  }

  return new Request(`http://${url.host}${url.pathname}${url.search}`, request);
}

/** Starts the daemon API server on its XDG runtime Unix socket. */
export async function startDaemon(): Promise<Deno.HttpServer<Deno.UnixAddr>> {
  const socketPath = getSocketPath();
  await removeStaleSocket(socketPath);

  return Deno.serve({
    path: socketPath,
    onListen({ path }) {
      console.log(`bootc-buddy daemon listening on ${path}`);
    },
  }, (request) => app.fetch(normalizeUnixSocketRequest(request)));
}

if (import.meta.main) {
  await startDaemon();
}
