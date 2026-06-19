import { Schema } from "effect";
import { bootcDeploymentSchema } from "./deployment.ts";
import { bootcImageReferenceSchema } from "./image-reference.ts";

const bootcStatusSchema_ = Schema.StructWithRest(
  Schema.Struct({
    apiVersion: Schema.String,
    kind: Schema.Literal("BootcHost"),
    metadata: Schema.StructWithRest(
      Schema.Struct({
        name: Schema.String,
      }),
      [Schema.Record(Schema.String, Schema.Unknown)],
    ),
    spec: Schema.StructWithRest(
      Schema.Struct({
        image: Schema.NullOr(bootcImageReferenceSchema),
        bootOrder: Schema.optional(Schema.String),
      }),
      [Schema.Record(Schema.String, Schema.Unknown)],
    ),
    status: Schema.StructWithRest(
      Schema.Struct({
        staged: Schema.NullOr(bootcDeploymentSchema),
        booted: Schema.NullOr(bootcDeploymentSchema),
        rollback: Schema.optional(Schema.NullOr(bootcDeploymentSchema)),
        rollbackQueued: Schema.optional(Schema.Boolean),
        type: Schema.optional(Schema.NullOr(Schema.String)),
      }),
      [Schema.Record(Schema.String, Schema.Unknown)],
    ),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

/** @ignore */
export const bootcStatusSchema = bootcStatusSchema_;

/** Parsed and validated response from `bootc status --format=json`. */
export type BootcStatus = typeof bootcStatusSchema.Type;
