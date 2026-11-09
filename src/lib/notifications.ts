import Notification from "@/models/Notification";

export interface CreateNotificationInput {
  recipient: unknown;
  type?: string;
  title: string;
  message?: string;
  link?: string;
  applicationId?: unknown;
  startupName?: string;
  roleTitle?: string;
}

/**
 * Server-only notification creation. The public API route no longer accepts
 * client-supplied notifications, which prevents spoofed/phishing notifications.
 */
export async function createNotification(input: CreateNotificationInput) {
  return Notification.create({
    recipient: input.recipient,
    type: input.type || "general",
    title: input.title,
    message: input.message || "",
    link: input.link || "",
    applicationId: input.applicationId || null,
    startupName: input.startupName || "",
    roleTitle: input.roleTitle || "",
    read: false,
  });
}
