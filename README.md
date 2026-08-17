# Founders Hook — campus founders meet campus builders

A Next.js 14 (App Router) + MongoDB social platform where college startup founders publish their ideas and startups, and students find and apply for real internship or full-time work.

## What's included

- **Welcome page** (`/`) — animated hero with a signature founders↔builders diagram, live stats strip, and a featured-startups grid using stock photography.
- **Authentication & Security** (`/login`, `/signup`, `/verify-email`) — Custom auth using bcrypt-hashed passwords and signed JWTs stored in httpOnly cookies. Includes an OTP email verification flow for new signups.
- **Onboarding** (`/onboarding`) — Multi-step questionnaire shown right after signup. Collects information about professional life, tech fields, experience, and availability.
- **Feed** (`/feed`) — A dynamic dashboard where users can discover and explore startup listings, view open roles, and see the latest updates.
- **Profiles & Directory** (`/profile`, `/users`, `/founders`) — Dedicated pages for viewing detailed user profiles, browsing all users, and specifically finding other founders on campus.
- **Networking** (`/networking`) — A dedicated space to connect with peers, follow other users, and expand your campus network.
- **Knowledge Hub** (`/knowledge-hub`) — A community resource where users can read or publish posts and articles regarding startup growth, fundraising, and productivity.
- **Founders Hook Dashboard** (`/founders-hook`) — An exclusive dashboard for founders to review and manage student applications for their startup roles.
- **AI Integration** — Next-generation features powered by AI (using the Vercel AI SDK) integrated throughout the platform.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up MongoDB and Environment Variables**

   Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) (or use a local MongoDB instance), then copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `.env.local` with your MongoDB URI, JWT secret, and any other required keys (e.g., AI/LLM API keys if applicable):

   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/founders-hook
   JWT_SECRET=<any long random string>
   ```

3. **Seed the database (Optional but recommended)**

   Populate your local database with sample users, startups, open roles, and knowledge hub posts so the feed has real data on the first run.

   ```bash
   npm run seed
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Project structure

```text
src/
  app/
    page.tsx                 Welcome / landing page
    login/                   Login
    signup/                  Sign up
    verify-email/            OTP verification
    onboarding/              Multi-step questionnaire
    feed/                    Discover startups & open roles
    founders-hook/           Founders' application management dashboard
    knowledge-hub/           Articles & resources
    networking/              Connections & follow system
    profile/                 User profiles
    users/                   Directory of campus builders
    founders/                Directory of campus founders
    api/                     Next.js API Routes (auth, startups, chat, etc.)
  components/                Reusable React components
  lib/                       Utilities (MongoDB connection, auth helpers)
  models/                    Mongoose models (User, Startup, Post, Application, etc.)
scripts/
  seed.ts                    Database seeding script
```

## Features Deep Dive

- **Startups & Roles**: Founders can create startups and publish open roles. Builders can browse these roles in the Feed and submit applications.
- **Application Flow**: Students apply to roles with a custom message. Founders receive these in the `/founders-hook` dashboard, where they can "Accept" or "Reject" them.
- **Following & Networking**: Users can follow each other, establishing a network within the campus startup ecosystem.

## Notes

- Stock photography is pulled live from Unsplash or Cloudinary.
- Fonts (Space Grotesk, Inter, JetBrains Mono, etc.) load via `next/font/google` and are optimized automatically at build time.
- The project leverages modern CSS and Framer Motion for rich, dynamic animations.
