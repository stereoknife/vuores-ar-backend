import { Document, model, Schema } from "mongoose"
import { ContentDocument } from "./Content"

export type CollectionDocument = Document & {
  name: string,
  contents: Schema.Types.ObjectId[] | ContentDocument[],
}

const collectionSchema = new Schema({
  name: {
    type: String,
    default: 'New Collection',
    required: true,
  },
  contents: [{ 
    type: Schema.Types.ObjectId, 
    ref:'Content',
  }],
})

export const Collection = model<CollectionDocument>('User', collectionSchema)
