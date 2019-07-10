import { Document, model, Schema } from "mongoose"
import { CollectionDocument } from "./Collection"

export type TargetDocument = Document & {
  name: string,
  collection: Schema.Types.ObjectId | CollectionDocument,
  updateTime: Date,
}

const targetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  collection: {
    type: Schema.Types.ObjectId,
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
})

export const Target = model<TargetDocument>('Target', targetSchema)
