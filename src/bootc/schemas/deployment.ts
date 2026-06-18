import { z } from "zod";
import { bootcImageReferenceSchema } from "./image-reference.ts";

const deploymentImageSchema = z.object({
  image: bootcImageReferenceSchema,
  version: z.string().nullable().optional(),
  timestamp: z.string().nullable().optional(),
  imageDigest: z.string().nullable().optional(),
}).passthrough();

const ostreeDeploymentSchema = z.object({
  checksum: z.string().optional(),
  deploySerial: z.number().int().optional(),
}).passthrough();

/** Schema for a bootc deployment slot. */
export const bootcDeploymentSchema = z.object({
  image: deploymentImageSchema.nullable().optional(),
  cachedUpdate: z.unknown().nullable().optional(),
  incompatible: z.boolean().optional(),
  pinned: z.boolean().optional(),
  ostree: ostreeDeploymentSchema.optional(),
}).passthrough();

/** Bootc deployment slot. */
export type BootcDeployment = z.infer<typeof bootcDeploymentSchema>;
