/**
 * Seeds a demo founder account, a handful of startups (with open internship
 * roles), and Knowledge Hub posts, so the feed has real data on first run.
 *
 * Usage:  npm run seed
 * Requires MONGODB_URI to be set in .env.local
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Startup from "../src/models/Startup";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force-demo")) {
    console.error(
      "Refusing to run the destructive demo seed in production. Pass --force-demo if you really intend to delete data."
    );
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI in .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB. Seeding…");

  // Clear old demo data so re-running the script is idempotent.
  await Promise.all([
    User.deleteMany({ email: /@demo.foundershook.com$/ }),
    Startup.deleteMany({}),
    Post.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);

  const founders = await User.insertMany([
    {
      name: "Shivang Verma",
      username: "shivangv",
      email: "shivang@demo.foundershook.com",
      passwordHash,
      avatarUrl: "https://picsum.photos/seed/shivang/200/200",
      college: "IIT Delhi",
      professionalStatus: "Founder",
      techFields: ["AI / Machine Learning", "Product Design"],
      expertiseLevel: "Advanced",
      lookingFor: "Hiring interns for my startup",
      onboardingComplete: true,
    },
    {
      name: "Aarav Mehta",
      username: "aaravm",
      email: "aarav@demo.foundershook.com",
      passwordHash,
      avatarUrl: "https://picsum.photos/seed/aarav/200/200",
      college: "BITS Pilani",
      professionalStatus: "Founder",
      techFields: ["Cybersecurity"],
      expertiseLevel: "Expert",
      lookingFor: "Hiring interns for my startup",
      onboardingComplete: true,
    },
    {
      name: "Ishita Verma",
      username: "ishitav",
      email: "ishita@demo.foundershook.com",
      passwordHash,
      avatarUrl: "https://picsum.photos/seed/ishita/200/200",
      college: "SRCC Delhi",
      professionalStatus: "Founder",
      techFields: ["Marketing & Growth"],
      expertiseLevel: "Intermediate",
      lookingFor: "Looking for a co-founder",
      onboardingComplete: true,
    },
    {
      name: "Kabir Singh",
      username: "kabirs",
      email: "kabir@demo.foundershook.com",
      passwordHash,
      avatarUrl: "https://picsum.photos/seed/kabir/200/200",
      college: "NIT Trichy",
      professionalStatus: "Founder",
      techFields: ["Cloud / DevOps"],
      expertiseLevel: "Advanced",
      lookingFor: "Hiring interns for my startup",
      onboardingComplete: true,
    },
    {
      name: "Liam Patel",
      username: "liamp",
      email: "liam@demo.foundershook.com",
      passwordHash,
      avatarUrl: "https://picsum.photos/seed/liam/200/200",
      college: "VIT Vellore",
      professionalStatus: "Working Professional",
      techFields: ["Fintech"],
      expertiseLevel: "Advanced",
      lookingFor: "Looking for a co-founder",
      onboardingComplete: true,
    },
  ]);

  const [shivang, aarav, ishita, kabir, liam] = founders;

  await Startup.insertMany([
    {
      name: "GreenTech Innovations",
      tagline: "Building sustainable solutions for a greener tomorrow.",
      description:
        "GreenTech Innovations designs low-cost solar and water-purification hardware for rural communities, paired with a mobile app that tracks impact.",
      category: "Climate Tech",
      icon: "🌱",
      coverImage: "https://picsum.photos/seed/greentech/800/500",
      founder: shivang._id,
      members: [shivang._id, ishita._id],
      featured: true,
      openRoles: [
        { title: "Sustainability Research Intern", type: "Internship", description: "Research renewable energy case studies." },
        { title: "Frontend Intern", type: "Internship", description: "Build the impact-tracking dashboard in React." },
      ],
    },
    {
      name: "NextGen AI",
      tagline: "AI-powered analytics platform for modern businesses.",
      description:
        "NextGen AI helps small businesses forecast demand and automate reporting using lightweight ML models.",
      category: "Artificial Intelligence",
      icon: "🧠",
      coverImage: "https://picsum.photos/seed/nextgenai/800/500",
      founder: liam._id,
      members: [liam._id],
      openRoles: [
        { title: "ML Intern", type: "Internship", description: "Fine-tune forecasting models on customer data." },
      ],
    },
    {
      name: "SecureStack AI",
      tagline: "Cybersecurity automation for a safer digital world.",
      description:
        "SecureStack AI automatically scans codebases and infrastructure for vulnerabilities and suggests fixes.",
      category: "Cybersecurity",
      icon: "🛡️",
      coverImage: "https://picsum.photos/seed/securestack/800/500",
      founder: aarav._id,
      members: [aarav._id, kabir._id, shivang._id],
      openRoles: [
        { title: "Security Research Intern", type: "Internship", description: "Help build our vulnerability rule set." },
        { title: "Backend Intern", type: "Internship", description: "Work on the scanning engine in Node.js." },
      ],
    },
    {
      name: "AeroNova AI",
      tagline: "Advancing aerospace technology with AI.",
      description:
        "AeroNova AI builds flight-path optimization software for small satellite operators.",
      category: "Aerospace",
      icon: "🚀",
      coverImage: "https://picsum.photos/seed/aeronova/800/500",
      founder: kabir._id,
      members: [kabir._id, liam._id],
      openRoles: [],
    },
    {
      name: "ImpactCraft Consulting",
      tagline: "Consulting and building tech solutions that drive impact.",
      description:
        "ImpactCraft partners with early-stage nonprofits to build their first digital products.",
      category: "Consulting",
      icon: "💡",
      coverImage: "https://picsum.photos/seed/impactcraft/800/500",
      founder: ishita._id,
      members: [ishita._id],
      openRoles: [
        { title: "Product Design Intern", type: "Internship", description: "Design product mockups for nonprofit clients." },
      ],
    },
  ]);

  await Post.insertMany([
    {
      title: "5 Growth Strategies Every Startup Should Know",
      category: "Startup Growth",
      excerpt:
        "From community-led growth to smart partnerships — the tactics early founders overlook.",
      content: "",
      authorName: "Sarah Chen",
      authorAvatar: "https://picsum.photos/seed/sarahchen/100/100",
    },
    {
      title: "How to Prepare for Your First Investor Pitch",
      category: "Fundraising",
      excerpt:
        "A practical checklist for first-time founders walking into a pitch meeting.",
      content: "",
      authorName: "Liam Patel",
      authorAvatar: "https://picsum.photos/seed/liam/100/100",
    },
    {
      title: "Productivity Hacks for Early Stage Founders",
      category: "Productivity",
      excerpt:
        "Small systems that save hours a week when you're doing five jobs at once.",
      content: "",
      authorName: "Aarav Mehta",
      authorAvatar: "https://picsum.photos/seed/aarav/100/100",
    },
    {
      title: "Building a Brand People Actually Remember",
      category: "Marketing",
      excerpt:
        "Why consistency beats cleverness when you're building an early audience.",
      content: "",
      authorName: "Ishita Verma",
      authorAvatar: "https://picsum.photos/seed/ishita/100/100",
    },
    {
      title: "Scaling Operations Without Losing Culture",
      category: "Operations",
      excerpt:
        "What changes — and what shouldn't — as your founding team starts to grow.",
      content: "",
      authorName: "Kabir Singh",
      authorAvatar: "https://picsum.photos/seed/kabir/100/100",
    },
  ]);

  console.log("Seed complete ✅");
  console.log("Demo login → username: shivangv  password: password123");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
