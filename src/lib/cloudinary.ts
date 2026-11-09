import { createHash } from "crypto";

function getCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryAdminConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

export function extractCloudinaryPublicId(url?: string | null): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== "res.cloudinary.com") return null;

  const config = getCloudinaryConfig();
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 4) return null;
  if (segments[0] !== config?.cloudName) return null;
  if (segments[1] !== "image") return null;

  const uploadIndex = segments.indexOf("upload");
  if (uploadIndex === -1) return null;

  let rest = segments.slice(uploadIndex + 1);

  const versionIndex = rest.findIndex((segment) => /^v\d+$/.test(segment));
  if (versionIndex >= 0) rest = rest.slice(versionIndex + 1);

  if (rest.length === 0) return null;

  const publicId = rest.join("/").replace(/\.[a-zA-Z0-9]+$/, "");
  return publicId || null;
}

function signParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

/**
 * Best-effort deletion of an uploaded Cloudinary image by its delivery URL.
 * No-ops when admin credentials are not configured or the URL is not a
 * Cloudinary asset owned by this project.
 */
export async function deleteCloudinaryAsset(url?: string | null): Promise<boolean> {
  const config = getCloudinaryConfig();
  if (!config) return false;

  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return false;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { public_id: publicId, timestamp };
  const signature = signParams(params, config.apiSecret);

  const body = new URLSearchParams({
    ...params,
    api_key: config.apiKey,
    signature,
  });

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { method: "POST", body }
    );

    if (!res.ok) {
      console.warn(
        `[cloudinary] Failed to delete asset ${publicId}: ${res.status} ${res.statusText}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`[cloudinary] Failed to delete asset ${publicId}:`, error);
    return false;
  }
}
