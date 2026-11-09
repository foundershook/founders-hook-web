import mongoose, { Schema, models, model } from "mongoose";

export interface IConversationDeletion {
  _id: mongoose.Types.ObjectId;
  conversationId: string;
  deletedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ConversationDeletionSchema = new Schema<IConversationDeletion>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default models.ConversationDeletion ||
  model<IConversationDeletion>("ConversationDeletion", ConversationDeletionSchema);
