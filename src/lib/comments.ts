import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CommentAuthor {
  _id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

export interface CommentReply {
  id: string;
  author: CommentAuthor;
  replyToUser?: string;
  content: string;
  createdAt: any;
}

export interface PostComment {
  id: string;
  postId: string;
  author: CommentAuthor;
  content: string;
  replyCount: number;
  likesCount?: number;
  createdAt: any;
  replies?: CommentReply[];
}

/**
 * Helper to strip undefined values so Firestore doesn't throw errors
 */
function sanitizeForFirestore(data: any): any {
  if (data === null || data === undefined) return null;
  if (typeof data !== "object") return data;
  if (data instanceof Timestamp) return data;
  if (Array.isArray(data)) return data.map(sanitizeForFirestore);

  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

/**
 * Subscribe to top-level comments for a post in real-time
 */
export function subscribeToPostComments(
  postId: string,
  callback: (comments: PostComment[]) => void
): Unsubscribe {
  const commentsRef = collection(db, "knowledge_comments", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: PostComment[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          postId,
          author: data.author,
          content: data.content,
          replyCount: data.replyCount || 0,
          likesCount: data.likesCount || 0,
          createdAt: data.createdAt,
        };
      });
      callback(comments);
    },
    (error) => {
      console.error("Error subscribing to post comments:", error);
      callback([]);
    }
  );
}

/**
 * Add a top-level comment to a post
 */
export async function addComment(
  postId: string,
  author: CommentAuthor,
  content: string
): Promise<string> {
  const commentsRef = collection(db, "knowledge_comments", postId, "comments");

  const cleanAuthor = sanitizeForFirestore({
    _id: author._id || "",
    name: author.name || "Founder",
    username: author.username || "",
    avatarUrl: author.avatarUrl || "",
  });

  const docRef = await addDoc(
    commentsRef,
    sanitizeForFirestore({
      author: cleanAuthor,
      content: content.trim(),
      replyCount: 0,
      likesCount: 0,
      createdAt: serverTimestamp(),
    })
  );

  return docRef.id;
}

/**
 * Add a reply to a comment (in the nested subcollection)
 */
export async function addReply(
  postId: string,
  commentId: string,
  author: CommentAuthor,
  content: string,
  replyToUser?: string
): Promise<string> {
  const repliesRef = collection(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId,
    "replies"
  );
  const parentCommentRef = doc(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId
  );

  const cleanAuthor = sanitizeForFirestore({
    _id: author._id || "",
    name: author.name || "Founder",
    username: author.username || "",
    avatarUrl: author.avatarUrl || "",
  });

  const replyDocRef = await addDoc(
    repliesRef,
    sanitizeForFirestore({
      author: cleanAuthor,
      content: content.trim(),
      replyToUser: replyToUser || "",
      createdAt: serverTimestamp(),
    })
  );

  // Increment replyCount on the parent comment
  await updateDoc(parentCommentRef, {
    replyCount: increment(1),
  });

  return replyDocRef.id;
}

/**
 * Fetch replies for a specific comment (on-demand when clicked)
 */
export async function fetchCommentReplies(
  postId: string,
  commentId: string
): Promise<CommentReply[]> {
  const repliesRef = collection(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId,
    "replies"
  );
  const q = query(repliesRef, orderBy("createdAt", "asc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      author: data.author,
      replyToUser: data.replyToUser,
      content: data.content,
      createdAt: data.createdAt,
    };
  });
}

/**
 * Delete a top-level comment
 */
export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  const commentRef = doc(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId
  );
  await deleteDoc(commentRef);
}

/**
 * Delete a reply
 */
export async function deleteReply(
  postId: string,
  commentId: string,
  replyId: string
): Promise<void> {
  const replyRef = doc(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId,
    "replies",
    replyId
  );
  const parentCommentRef = doc(
    db,
    "knowledge_comments",
    postId,
    "comments",
    commentId
  );

  await deleteDoc(replyRef);
  await updateDoc(parentCommentRef, {
    replyCount: increment(-1),
  });
}
