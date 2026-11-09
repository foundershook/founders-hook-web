import mongoose, { Schema, Document, models, model } from "mongoose";

// User interface extending Mongoose Document
export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  mobile?: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  skills: string[];
  
  onboardingAnswers: Map<string, any>; 
  
  onboardingComplete: boolean;

  // Incremented whenever credentials change, which invalidates older sessions.
  sessionVersion: number;
  
  // Waitlist and Early Access fields
  isEarlyAccess: boolean;
  vipCode?: string;

  // Social graph
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    mobile: { type: String, default: "", trim: true },
    avatarUrl: {
      type: String,
      default: "https://picsum.photos/seed/avatar/200/200",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1200,
    },
    skills: {
      type: [String],
      default: [],
    },
    
    // Dynamic answers map
    onboardingAnswers: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    
    onboardingComplete: { type: Boolean, default: false },

    sessionVersion: { type: Number, default: 0 },
    
    // Waitlist / Early Access fields
    isEarlyAccess: { 
      type: Boolean, 
      default: true // Defaults to true while you are in the waitlist phase
    },
    vipCode: { 
      type: String, 
      unique: true, 
      sparse: true // Allows this field to be null/omitted for future standard users without triggering unique constraint errors
    },

    // Social graph
    followers: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],
    following: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = models?.User || model<IUser>("User", UserSchema);
export default User;