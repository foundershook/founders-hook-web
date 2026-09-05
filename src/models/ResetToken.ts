import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IResetToken extends Document {
  email: string;
  otpHash: string; // The hashed 6-digit OTP
  expiresAt: Date;
  createdAt: Date;
}

const ResetTokenSchema = new Schema<IResetToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete document when this date is reached
    },
  },
  { timestamps: true }
);

const ResetToken =
  models?.ResetToken || model<IResetToken>("ResetToken", ResetTokenSchema);

export default ResetToken;
