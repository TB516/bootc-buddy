import { Schema } from "effect";
import { bootcImageReferenceSchema } from "./image-reference.ts";

const deploymentImageSchema = Schema.StructWithRest(
  Schema.Struct({
    image: bootcImageReferenceSchema,
    version: Schema.optional(Schema.NullOr(Schema.String)),
    timestamp: Schema.optional(Schema.NullOr(Schema.String)),
    imageDigest: Schema.optional(Schema.NullOr(Schema.String)),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const ostreeDeploymentSchema = Schema.StructWithRest(
  Schema.Struct({
    checksum: Schema.optional(Schema.String),
    deploySerial: Schema.optional(Schema.Int),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const bootcDeploymentSchema_ = Schema.StructWithRest(
  Schema.Struct({
    image: Schema.optional(Schema.NullOr(deploymentImageSchema)),
    cachedUpdate: Schema.optional(Schema.NullOr(Schema.Unknown)),
    incompatible: Schema.optional(Schema.Boolean),
    pinned: Schema.optional(Schema.Boolean),
    ostree: Schema.optional(ostreeDeploymentSchema),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

/** @ignore */
export const bootcDeploymentSchema = bootcDeploymentSchema_;
