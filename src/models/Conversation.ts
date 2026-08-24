import mongoose, { Schema, models, model } from "mongoose";

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  type: "application" | "inter-team" | "direct";
  application?: mongoose.Types.ObjectId;
  startup?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  lastMessagePreview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: {
      type: String,
      enum: ["application", "inter-team", "direct"],
      required: true,
    },
    application: { type: Schema.Types.ObjectId, ref: "Application" },
    startup: { type: Schema.Types.ObjectId, ref: "Startup" },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: "" },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ application: 1 });

export default models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);
