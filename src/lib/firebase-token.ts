import { SignJWT, importPKCS8 } from "jose";

/**
 * Mints a Firebase custom token whose `uid` is the MongoDB user id.
 *
 * Requires a Firebase service account. Configure:
 *   FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *
 * The client exchanges this token with `signInWithCustomToken`, and the
 * Firestore rules use `request.auth.uid` to authorize reads/writes.
 */
export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  );
}

export async function createFirebaseCustomToken(uid: string): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    throw new Error("Firebase admin credentials are not configured");
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(privateKey, "RS256");

  return new SignJWT({ uid })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(
      "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit"
    )
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}
