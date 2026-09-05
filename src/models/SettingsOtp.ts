import mongoose, { Schema, Document } from "mongoose";

export interface ISettingsOtp extends Document {
  userId: mongoose.Types.ObjectId;
  action: "email" | "username" | "password";
  newData?: string; // e.g., the new email or new username
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const SettingsOtpSchema = new Schema<ISettingsOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["email", "username", "password"], required: true },
    newData: { type: String },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete documents when they expire
SettingsOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SettingsOtpSchema.index({ userId: 1, action: 1 });

const SettingsOtp = mongoose.models.SettingsOtp || mongoose.model<ISettingsOtp>("SettingsOtp", SettingsOtpSchema);

export default SettingsOtp;
