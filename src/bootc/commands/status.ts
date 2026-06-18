import { t } from "try";
import * as errors from "../errors.ts";
import { runBootcCommand } from "../runtime/mod.ts";
import { type BootcStatus, bootcStatusSchema } from "../schemas/status.ts";

export type { BootcStatus } from "../schemas/status.ts";

/**
 * Run `bootc status --format=json` as root through polkit and validate the response.
 *
 * @throws {Deno.errors.NotFound} When `pkexec` or `flatpak-spawn` is missing.
 * @throws {Deno.errors.PermissionDenied} When starting `pkexec` or `flatpak-spawn` is denied.
 * @throws {errors.CommandStartError} When the command cannot be started for another reason.
 * @throws {errors.CommandExitError} When the `pkexec bootc status --format=json` command exits unsuccessfully.
 * @throws {errors.BootcInvalidResponseError} When `bootc` returns JSON the app cannot use.
 */
export async function getBootcStatus(): Promise<BootcStatus> {
  const output = await runBootcCommand(["status", "--format=json"]);

  const parsed = t(() => JSON.parse(output.stdout) as unknown);
  if (!parsed.ok) {
    throw new errors.BootcInvalidResponseError(
      "bootc status --format=json returned invalid JSON",
      parsed.error,
    );
  }

  const result = bootcStatusSchema.safeParse(parsed.value);
  if (!result.success) {
    throw new errors.BootcInvalidResponseError(
      "bootc status --format=json returned an unexpected response shape",
      result.error,
    );
  }

  return result.data;
}
