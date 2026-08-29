import mongoose, { Schema, models, model } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type?: "text" | "meet";
  meetUrl?: string;
  meetStatus?: "active" | "ended";
  endedAt?: Date;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "meet"], default: "text" },
    meetUrl: { type: String },
    meetStatus: { type: String, enum: ["active", "ended"], default: "active" },
    endedAt: { type: Date },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: 1 });

export default models.Message || model<IMessage>("Message", MessageSchema);

