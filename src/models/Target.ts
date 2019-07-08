import { Document, model, Schema } from "mongoose"

export type TargetDocument = Document & {
  name: string,
  collection: string,
  updateTime: Date,
  contents: Document | string,
}

const targetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  collection: {
    type: Schema.Types.ObjectId,
    default: true,
    required: true,
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
  contents: [{ 
    type: Schema.Types.ObjectId, 
    ref:'Content',
  }],
})

export const Target = model<TargetDocument>('Target', targetSchema)
