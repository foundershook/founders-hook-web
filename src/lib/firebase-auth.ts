import {
  getAuth,
  signInWithCustomToken,
  type Unsubscribe as AuthUnsubscribe,
} from "firebase/auth";
import app from "./firebase";

let signInPromise: Promise<void> | null = null;

/**
 * Ensures the browser has a Firebase Auth session whose uid matches the
 * MongoDB user id. Called before every Firestore read/write.
 *
 * The server mints a custom token from the verified session cookie. If the
 * server has no Firebase service-account credentials configured, we only allow
 * the request to proceed in development (so local chat keeps working); in
 * production this fails closed.
 */
export function ensureFirebaseAuth(): Promise<void> {
  if (!signInPromise) {
    signInPromise = (async () => {
      const auth = getAuth(app);
      if (auth.currentUser) return;

      const res = await fetch("/api/auth/firebase-token", { method: "POST" });

      if (!res.ok) {
        if (res.status === 503 && process.env.NODE_ENV !== "production") {
          console.warn(
            "[firebase-auth] Firebase admin credentials are not configured; " +
              "chat runs unauthenticated in development only."
          );
          return;
        }
        throw new Error("Unable to authenticate chat.");
      }

      const data = (await res.json()) as { token?: string };
      if (!data.token) throw new Error("Missing Firebase token.");
      await signInWithCustomToken(auth, data.token);
    })().catch((error) => {
      signInPromise = null;
      throw error;
    });
  }
  return signInPromise;
}

/**
 * Starts a Firestore subscription after authentication succeeds, while still
 * returning a synchronous unsubscribe function to the caller.
 */
export function authAwareSubscribe(
  start: () => AuthUnsubscribe,
  onError?: (error: unknown) => void
): AuthUnsubscribe {
  let unsubscribe: AuthUnsubscribe = () => {};
  let cancelled = false;

  ensureFirebaseAuth()
    .then(() => {
      if (!cancelled) unsubscribe = start();
    })
    .catch((error) => {
      console.error("[firebase-auth] authentication failed:", error);
      onError?.(error);
    });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
