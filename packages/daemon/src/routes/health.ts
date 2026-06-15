import { Elysia } from "elysia";

/**
 * Health check routes for the daemon API.
 *
 * @ignore Deno docs lint cannot represent the inferred Elysia route type.
 */
export const healthRoutes = new Elysia().get("/health", () => ({
  status: "ok",
}));
