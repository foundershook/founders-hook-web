import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IOtpVerification extends Document {
  email: string;
  otpHash: string;
  formData: {
    name: string;
    username: string;
    passwordHash: string;
    avatarUrl: string;
    vipCode: string;
    tncAccepted: boolean;
    tncVersion: string;
  };
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
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
    formData: {
      name: { type: String, required: true },
      username: { type: String, required: true },
      passwordHash: { type: String, required: true },
      avatarUrl: { type: String, required: true },
      vipCode: { type: String, required: true },
      tncAccepted: { type: Boolean, required: true },
      tncVersion: { type: String, required: true },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL: document auto-deleted when expiresAt is reached
    },
  },
  { timestamps: true }
);

const OtpVerification =
  models?.OtpVerification ||
  model<IOtpVerification>("OtpVerification", OtpVerificationSchema);

export default OtpVerification;
