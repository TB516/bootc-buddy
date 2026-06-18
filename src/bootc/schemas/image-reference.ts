import { z } from "zod";

/** Schema for a bootc image reference. */
export const bootcImageReferenceSchema = z.object({
  image: z.string(),
  transport: z.string(),
}).passthrough();

/** Bootc image reference. */
export type BootcImageReference = z.infer<typeof bootcImageReferenceSchema>;
