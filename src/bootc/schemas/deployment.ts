import { Schema } from "effect";
import { bootcImageReferenceSchema } from "./image-reference.ts";

const imageStatusSchema = Schema.StructWithRest(
  Schema.Struct({
    image: bootcImageReferenceSchema,
    imageDigest: Schema.String,
    architecture: Schema.String,
    version: Schema.optional(Schema.NullOr(Schema.String)),
    timestamp: Schema.optional(Schema.NullOr(Schema.String)),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const ostreeDeploymentSchema = Schema.StructWithRest(
  Schema.Struct({
    stateroot: Schema.optional(Schema.String),
    checksum: Schema.String,
    deploySerial: Schema.Int.pipe(Schema.check(Schema.isUint32())),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const composefsDeploymentSchema = Schema.StructWithRest(
  Schema.Struct({
    verity: Schema.String,
    bootType: Schema.Union([Schema.Literal("Bls"), Schema.Literal("Uki")]),
    bootloader: Schema.Union([
      Schema.Literal("grub"),
      Schema.Literal("systemd"),
      Schema.Literal("none"),
    ]),
    bootDigest: Schema.NullOr(Schema.String),
    missingVerityAllowed: Schema.Boolean,
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const bootcDeploymentSchema_ = Schema.StructWithRest(
  Schema.Struct({
    image: Schema.optional(Schema.NullOr(imageStatusSchema)),
    cachedUpdate: Schema.optional(Schema.NullOr(imageStatusSchema)),
    incompatible: Schema.Boolean,
    pinned: Schema.Boolean,
    softRebootCapable: Schema.optional(Schema.Boolean),
    downloadOnly: Schema.optional(Schema.Boolean),
    store: Schema.optional(Schema.NullOr(Schema.Literal("ostreeContainer"))),
    ostree: Schema.optional(Schema.NullOr(ostreeDeploymentSchema)),
    composefs: Schema.optional(Schema.NullOr(composefsDeploymentSchema)),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

/** @ignore */
export const bootcDeploymentSchema = bootcDeploymentSchema_;
