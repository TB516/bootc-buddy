import { z } from "zod";
import { bootcDeploymentSchema } from "./deployment.ts";
import { bootcImageReferenceSchema } from "./image-reference.ts";

/** Schema for `bootc status --format=json` output. */
export const bootcStatusSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("BootcHost"),
  metadata: z.object({
    name: z.string(),
  }).passthrough(),
  spec: z.object({
    image: bootcImageReferenceSchema.nullable(),
    bootOrder: z.string().optional(),
  }).passthrough(),
  status: z.object({
    staged: bootcDeploymentSchema.nullable(),
    booted: bootcDeploymentSchema.nullable(),
    rollback: bootcDeploymentSchema.nullable().optional(),
    rollbackQueued: z.boolean().optional(),
    type: z.string().nullable().optional(),
  }).passthrough(),
}).passthrough();

/** Parsed and validated response from `bootc status --format=json`. */
export type BootcStatus = z.infer<typeof bootcStatusSchema>;
