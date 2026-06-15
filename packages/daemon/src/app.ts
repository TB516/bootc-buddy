import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health.ts";

/**
 * Elysia app for the bootc-buddy daemon API.
 *
 * @ignore Deno docs lint cannot represent the inferred Elysia type Eden needs.
 */
export const app = new Elysia().use(healthRoutes);

/** Raw daemon app type for Eden Treaty. */
export type App = typeof app;
