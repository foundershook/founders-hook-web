import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ParticipantUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
  email?: string;
  mobile?: string;
  gender?: string;
  experience?: string;
  resumeUrl?: string;
  resumeName?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

export interface ActiveMeetInfo {
  messageId: string;
  meetUrl: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  startupName?: string;
  createdAt: string;
}

export interface ConversationDoc {
  _id: string;
  participants: string[];
  type: "application" | "inter-team" | "direct";
  applicationId?: string;
  startupId?: string;
  application?: any;
  startup?: {
    _id?: string;
    name?: string;
    icon?: string;
  };
  activeMeet?: ActiveMeetInfo | null;
  lastMessageAt?: string | null;
  lastMessagePreview?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageDoc {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  content: string;
  type?: "text" | "meet" | "application_card";
  applicationData?: {
    roleTitle: string;
    applicantName: string;
    email?: string;
    mobile?: string;
    experience?: string;
    resumeUrl?: string;
    resumeName?: string;
    message?: string;
  };
  meetUrl?: string;
  meetStatus?: "active" | "ended";
  endedAt?: string;
  readBy?: string[];
  createdAt: string;
}

/**
 * Real-time subscription to all conversations for a user.
 */
export function subscribeConversations(
  userId: string,
  onUpdate: (conversations: ConversationDoc[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const convosRef = collection(db, "conversations");
  const q = query(convosRef, where("participants", "array-contains", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const convos: ConversationDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          _id: docSnap.id,
          participants: data.participants || [],
          type: data.type || "direct",
          applicationId: data.applicationId,
          startupId: data.startupId,
          application: data.application,
          startup: data.startup,
          activeMeet: data.activeMeet || null,
          lastMessageAt: data.lastMessageAt || null,
          lastMessagePreview: data.lastMessagePreview || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      // Sort by lastMessageAt descending client-side
      convos.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      onUpdate(convos);
    },
    (err) => {
      console.error("Error subscribing to conversations:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time subscription to messages within a conversation.
 */
export function subscribeMessages(
  conversationId: string,
  onUpdate: (messages: MessageDoc[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: MessageDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt instanceof Timestamp) {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === "string") {
          createdAtStr = data.createdAt;
        }

        return {
          _id: docSnap.id,
          conversation: conversationId,
          sender: data.sender || { _id: "", name: "Unknown", username: "", avatarUrl: "" },
          content: data.content || "",
          type: data.type || "text",
          applicationData: data.applicationData || null,
          meetUrl: data.meetUrl,
          meetStatus: data.meetStatus,
          endedAt: data.endedAt,
          readBy: data.readBy || [],
          createdAt: createdAtStr,
        };
      });

      onUpdate(messages);
    },
    (err) => {
      console.error("Error subscribing to messages:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Send an application card message when an applicant applies to a startup.
 */
export async function sendApplicationCardMessage(
  conversationId: string,
  sender: { _id: string; name: string; username: string; avatarUrl: string },
  applicationData: {
    roleTitle: string;
    applicantName: string;
    email?: string;
    mobile?: string;
    experience?: string;
    resumeUrl?: string;
    resumeName?: string;
    message?: string;
  }
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const now = new Date().toISOString();

  const cleanSender = sanitizeForFirestore({
    _id: sender._id || "",
    name: sender.name || "Applicant",
    username: sender.username || "",
    avatarUrl: sender.avatarUrl || "",
  });

  const preview = `📄 Applied for ${applicationData.roleTitle}: ${
    applicationData.message
      ? `"${applicationData.message.slice(0, 40)}..."`
      : "New application received"
  }`;

  await addDoc(
    messagesRef,
    sanitizeForFirestore({
      sender: cleanSender,
      content: preview,
      type: "application_card",
      applicationData: {
        roleTitle: applicationData.roleTitle || "Role",
        applicantName: applicationData.applicantName || "Applicant",
        email: applicationData.email || "",
        mobile: applicationData.mobile || "",
        experience: applicationData.experience || "",
        resumeUrl: applicationData.resumeUrl || "",
        resumeName: applicationData.resumeName || "",
        message: applicationData.message || "",
      },
      readBy: [sender._id],
      createdAt: serverTimestamp(),
    })
  );

  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(
    convoRef,
    sanitizeForFirestore({
      lastMessageAt: now,
      lastMessagePreview: preview,
      updatedAt: now,
    })
  );
}

/**
 * Send a chat message and update the parent conversation's last message metadata.
 */
export async function sendChatMessage(
  conversationId: string,
  sender: { _id: string; name: string; username: string; avatarUrl: string },
  content: string
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const now = new Date().toISOString();

  const cleanSender = sanitizeForFirestore({
    _id: sender._id || "",
    name: sender.name || "User",
    username: sender.username || "",
    avatarUrl: sender.avatarUrl || "",
  });

  await addDoc(messagesRef, {
    sender: cleanSender,
    content,
    type: "text",
    readBy: [sender._id],
    createdAt: serverTimestamp(),
  });

  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(convoRef, sanitizeForFirestore({
    lastMessageAt: now,
    lastMessagePreview: content.length > 80 ? content.slice(0, 80) + "..." : content,
    updatedAt: now,
  }));
}

/**
 * Send a Google Meet call invitation message and signal active call on conversation.
 */
export async function sendMeetingInvite(
  conversationId: string,
  sender: { _id: string; name: string; username: string; avatarUrl: string },
  meetUrl: string,
  startupName?: string
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const now = new Date().toISOString();

  const cleanSender = sanitizeForFirestore({
    _id: sender._id || "",
    name: sender.name || "User",
    username: sender.username || "",
    avatarUrl: sender.avatarUrl || "",
  });

  const docRef = await addDoc(messagesRef, sanitizeForFirestore({
    sender: cleanSender,
    content: "📹 Started a Google Meet: Click to join",
    type: "meet",
    meetUrl,
    meetStatus: "active",
    readBy: [sender._id],
    createdAt: serverTimestamp(),
  }));

  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(convoRef, sanitizeForFirestore({
    lastMessageAt: now,
    lastMessagePreview: "📹 Google Meet Invitation",
    activeMeet: {
      messageId: docRef.id,
      meetUrl,
      sender: cleanSender,
      startupName: startupName || "Founders Hook",
      createdAt: now,
    },
    updatedAt: now,
  }));

  return docRef.id;
}

/**
 * End an active meeting call.
 */
export async function endMeetingCall(conversationId: string, messageId?: string) {
  const now = new Date().toISOString();
  if (messageId) {
    try {
      const msgRef = doc(db, "conversations", conversationId, "messages", messageId);
      await updateDoc(msgRef, {
        meetStatus: "ended",
        endedAt: now,
      });
    } catch (e) {
      console.warn("Could not update message ended status in Firestore:", e);
    }
  }

  try {
    const convoRef = doc(db, "conversations", conversationId);
    await updateDoc(convoRef, {
      activeMeet: null,
      updatedAt: now,
    });
  } catch (e) {
    console.warn("Could not clear activeMeet on convo:", e);
  }
}

/**
 * Recursively removes all undefined fields so Firestore setDoc/updateDoc never fails.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return data;
}

/**
 * Ensure a conversation document exists in Firestore (synced from MongoDB Application data)
 * without overwriting existing messages or lastMessage timestamps.
 */
export async function syncFirestoreConversation(convoData: {
  id: string;
  participants: string[];
  type: "application" | "inter-team" | "direct";
  applicationId?: string | null;
  startupId?: string | null;
  application?: any;
  startup?: any;
}) {
  const convoRef = doc(db, "conversations", convoData.id);
  const now = new Date().toISOString();

  const payload = sanitizeForFirestore({
    participants: convoData.participants || [],
    type: convoData.type || "application",
    applicationId: convoData.applicationId || null,
    startupId: convoData.startupId || null,
    application: convoData.application || null,
    startup: convoData.startup || null,
    updatedAt: now,
  });

  await setDoc(convoRef, payload, { merge: true });
}

/**
 * Real-time subscription to incoming video calls across all user's conversations.
 */
export function subscribeIncomingCalls(
  userId: string,
  onIncomingCall: (call: {
    messageId: string;
    conversationId: string;
    meetUrl: string;
    sender: { _id: string; name: string; username: string; avatarUrl?: string };
    startupName: string;
    createdAt: string;
  } | null) => void
): Unsubscribe {
  const convosRef = collection(db, "conversations");
  const q = query(convosRef, where("participants", "array-contains", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      let foundCall: any = null;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const activeMeet = data.activeMeet;
        if (
          activeMeet &&
          activeMeet.sender?._id !== userId &&
          activeMeet.messageId
        ) {
          // Check if active within the last 5 minutes
          const meetTime = activeMeet.createdAt
            ? new Date(activeMeet.createdAt).getTime()
            : 0;
          if (now - meetTime < 5 * 60 * 1000) {
            foundCall = {
              messageId: activeMeet.messageId,
              conversationId: docSnap.id,
              meetUrl: activeMeet.meetUrl || "https://meet.google.com/new",
              sender: activeMeet.sender,
              startupName: activeMeet.startupName || "Founders Hook",
              createdAt: activeMeet.createdAt,
            };
            break;
          }
        }
      }

      onIncomingCall(foundCall);
    },
    (err) => {
      console.error("Error subscribing to incoming calls:", err);
    }
  );
}
