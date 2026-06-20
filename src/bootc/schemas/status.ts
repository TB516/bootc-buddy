import { Schema } from "effect";
import { bootcDeploymentSchema } from "./deployment.ts";
import { bootcImageReferenceSchema } from "./image-reference.ts";

const filesystemOverlaySchema = Schema.StructWithRest(
  Schema.Struct({
    accessMode: Schema.Union([Schema.Literal("readOnly"), Schema.Literal("readWrite")]),
    persistence: Schema.Union([Schema.Literal("transient"), Schema.Literal("persistent")]),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const bootcStatusSchema_ = Schema.StructWithRest(
  Schema.Struct({
    apiVersion: Schema.Literal("org.containers.bootc/v1"),
    kind: Schema.Literal("BootcHost"),
    metadata: Schema.StructWithRest(
      Schema.Struct({
        name: Schema.optional(Schema.NullOr(Schema.String)),
        namespace: Schema.optional(Schema.NullOr(Schema.String)),
        labels: Schema.optional(Schema.NullOr(Schema.Record(Schema.String, Schema.String))),
        annotations: Schema.optional(Schema.NullOr(Schema.Record(Schema.String, Schema.String))),
      }),
      [Schema.Record(Schema.String, Schema.Unknown)],
    ),
    spec: Schema.StructWithRest(
      Schema.Struct({
        image: Schema.NullOr(bootcImageReferenceSchema),
        bootOrder: Schema.optional(
          Schema.Union([Schema.Literal("default"), Schema.Literal("rollback")]),
        ),
      }),
      [Schema.Record(Schema.String, Schema.Unknown)],
    ),
    status: Schema.StructWithRest(
      Schema.Struct({
        staged: Schema.NullOr(bootcDeploymentSchema),
        booted: Schema.NullOr(bootcDeploymentSchema),
        rollback: Schema.NullOr(bootcDeploymentSchema),
        otherDeployments: Schema.optional(Schema.Array(bootcDeploymentSchema)),
        rollbackQueued: Schema.Boolean,
        type: Schema.NullOr(Schema.Literal("bootcHost")),
        usrOverlay: Schema.optional(Schema.NullOr(filesystemOverlaySchema)),
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
