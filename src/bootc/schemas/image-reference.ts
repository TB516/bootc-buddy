import { Schema } from "effect";

const imageSignatureSchema = Schema.Union([
  Schema.Struct({
    ostreeRemote: Schema.String,
  }),
  Schema.Literal("containerPolicy"),
  Schema.Literal("insecure"),
]);

const bootcImageReferenceSchema_ = Schema.StructWithRest(
  Schema.Struct({
    image: Schema.String,
    transport: Schema.String,
    signature: Schema.optional(Schema.NullOr(imageSignatureSchema)),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

/** @ignore */
export const bootcImageReferenceSchema = bootcImageReferenceSchema_;
