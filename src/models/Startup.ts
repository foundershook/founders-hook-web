import mongoose, { Schema, models, model } from "mongoose";

export interface IOpenRole {
  title: string;
  type: "Internship" | "Full-time" | "Part-time";
  description: string;
  paid: boolean;
}

export interface IAiInsights {
  about: string;
  problem: string;
  solution: string;
  analysedAt: Date;
}

export interface IStartup {
  _id: mongoose.Types.ObjectId;
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  coverImage: string;
  website?: string;
  aiInsights?: IAiInsights;
  founder: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  openRoles: IOpenRole[];
  featured: boolean;
  createdAt: Date;
}

const OpenRoleSchema = new Schema<IOpenRole>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time"],
      default: "Internship",
    },
    description: { type: String, default: "" },
    paid: { type: Boolean, default: false },
  },
  { _id: true }
);

const AiInsightsSchema = new Schema<IAiInsights>(
  {
    about: { type: String, default: "" },
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    analysedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StartupSchema = new Schema<IStartup>(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    icon: { type: String, default: "🚀" },
    coverImage: {
      type: String,
      default: "https://picsum.photos/seed/startup/800/500",
    },
    website: { type: String, default: "" },
    aiInsights: { type: AiInsightsSchema, default: undefined },
    founder: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    openRoles: [OpenRoleSchema],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Startup || model<IStartup>("Startup", StartupSchema);
