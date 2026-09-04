import mongoose, { Schema, models, model } from "mongoose";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: "application_accepted" | "application_rejected" | "new_application" | "general";
  title: string;
  message: string;
  link?: string;
  applicationId?: mongoose.Types.ObjectId;
  startupName?: string;
  roleTitle?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["application_accepted", "application_rejected", "new_application", "general"],
      default: "general",
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    startupName: { type: String, default: "" },
    roleTitle: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default models.Notification ||
  model<INotification>("Notification", NotificationSchema);
