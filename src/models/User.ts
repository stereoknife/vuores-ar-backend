import { Document, model, Schema } from "mongoose"

export type UserDocument = Document & {
  display: string,
  email: string,
  hash: string,
  rank: number,
}

const userSchema = new Schema({
  display: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
    default: 0,
  },
})

export const User = model<UserDocument>('User', userSchema)
