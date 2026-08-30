import mongoose, { Schema, Document, models, model } from "mongoose";

// User interface extending Mongoose Document
export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  
  onboardingAnswers: Map<string, any>; 
  
  onboardingComplete: boolean;
  
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
    passwordHash: { type: String, required: true },
    avatarUrl: {
      type: String,
      default: "https://picsum.photos/seed/avatar/200/200",
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
  { timestamps: true }
);

const User = models?.User || model<IUser>("User", UserSchema);
export default User;