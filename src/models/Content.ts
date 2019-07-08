import { Document, model, Schema } from "mongoose"

export type ContentDocument = Document & {
  order: number,
  enabled: boolean,
  type: string,
  url: string,
  desc: string,
  addedBy: Document | string,
  // target: mongoose.Document | String,
  updateTime: Date
}

const contentSchema = new Schema({
  order: {
    type: Number,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  desc: String,
  addedBy: {type: Schema.Types.ObjectId, ref: 'User'},
  // target: Schema.Types.ObjectId,
  updateTime: {
    type: Date,
    default: Date.now(),
  },
})

export const Content = model<ContentDocument>('Content', contentSchema)
