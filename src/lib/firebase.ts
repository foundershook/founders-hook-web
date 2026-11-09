import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required Firebase configuration: ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ),
  authDomain: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  projectId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ),
  storageBucket: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  messagingSenderId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  ),
};

// Initialize Firebase client singleton safely for Next.js hot-reload.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
