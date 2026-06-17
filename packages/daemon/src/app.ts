import { Elysia } from "elysia";
import config from "../deno.json" with { type: "json" };

/**
 * Elysia app for the bootc-buddy daemon API.
 *
 * @ignore Deno docs lint cannot represent the inferred Elysia type Eden needs.
 */
export const app = new Elysia().get("/", () => ({
  version: config.version,
  status: "ok" as const,
}));

/** Raw daemon app type for Eden Treaty. */
export type App = typeof app;
