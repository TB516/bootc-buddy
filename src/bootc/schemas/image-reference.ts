import { Schema } from "effect";

const bootcImageReferenceSchema_ = Schema.StructWithRest(
  Schema.Struct({
    image: Schema.String,
    transport: Schema.String,
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

/** @ignore */
export const bootcImageReferenceSchema = bootcImageReferenceSchema_;
