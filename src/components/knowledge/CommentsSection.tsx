"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  CornerDownRight,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Reply,
} from "lucide-react";
import {
  PostComment,
  CommentReply,
  CommentAuthor,
  subscribeToPostComments,
  addComment,
  addReply,
  fetchCommentReplies,
  deleteComment,
  deleteReply,
} from "@/lib/comments";
import { timeAgo } from "@/lib/timeAgo";

interface CommentsSectionProps {
  postId: string;
  currentUser: any;
}

function parseDate(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

export default function CommentsSection({ postId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Map of commentId -> CommentReply[]
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentReply[]>>({});
  // Set of open comment IDs (where replies are visible)
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  // Loading state for fetching replies
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  // Active reply box (commentId currently being replied to)
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Subscribe to comments
  useEffect(() => {
    if (!postId) return;
    setLoading(true);

    const unsubscribe = subscribeToPostComments(postId, (liveComments) => {
      setComments(liveComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const authorData: CommentAuthor = {
    _id: currentUser?._id || "",
    name: currentUser?.name || currentUser?.username || "Guest",
    username: currentUser?.username || "",
    avatarUrl: currentUser?.avatarUrl || currentUser?.profileImage || "",
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await addComment(postId, authorData, newCommentText);
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleReplies = async (commentId: string) => {
    const isCurrentlyOpen = !!openReplies[commentId];

    if (isCurrentlyOpen) {
      setOpenReplies((prev) => ({ ...prev, [commentId]: false }));
    } else {
      setOpenReplies((prev) => ({ ...prev, [commentId]: true }));
      // If we haven't loaded replies yet, fetch them
      if (!repliesMap[commentId]) {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
        try {
          const replies = await fetchCommentReplies(postId, commentId);
          setRepliesMap((prev) => ({ ...prev, [commentId]: replies }));
        } catch (err) {
          console.error("Failed to fetch replies:", err);
        } finally {
          setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        }
      }
    }
  };

  const handleCreateReply = async (
    parentCommentId: string,
    replyToUserName: string
  ) => {
    if (!replyText.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const replyId = await addReply(
        postId,
        parentCommentId,
        authorData,
        replyText,
        replyToUserName
      );

      // Instantly append reply to local cache so user sees it right away
      const newReplyItem: CommentReply = {
        id: replyId,
        author: authorData,
        replyToUser: replyToUserName,
        content: replyText.trim(),
        createdAt: new Date(),
      };

      setRepliesMap((prev) => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] || []), newReplyItem],
      }));

      // Ensure replies view is open
      setOpenReplies((prev) => ({ ...prev, [parentCommentId]: true }));

      // Reset
      setReplyText("");
      setReplyingToCommentId(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(postId, commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await deleteReply(postId, commentId, replyId);
      // Remove from local cache
      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || []).filter((r) => r.id !== replyId),
      }));
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  };

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + (c.replyCount || 0),
    0
  );

  return (
    <div className="mt-14 border-t border-ink-800 pt-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white">
            <MessageSquare size={20} />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-sand-100">
              Comments & Discussion
            </h3>
            <p className="text-xs text-sand-400">
              {totalCount === 1 ? "1 thought" : `${totalCount} thoughts`} shared
            </p>
          </div>
        </div>
      </div>

      {/* Main Comment Input */}
      {currentUser ? (
        <form onSubmit={handleCreateComment} className="mb-10 flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              currentUser.avatarUrl ||
              currentUser.profileImage ||
              "https://picsum.photos/seed/current/64/64"
            }
            alt={currentUser.name || "User"}
            className="h-10 w-10 shrink-0 rounded-full object-cover border border-ink-700/60"
          />
          <div className="relative flex-1">
            <textarea
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts on this article? Ask a question or share feedback…"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white placeholder:text-sand-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all resize-none shadow-inner"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-ink-950 shadow-sm hover:bg-sand-200 transition-all disabled:opacity-40"
              >
                {submittingComment ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-sand-400">
          Sign in to join the discussion and share your insights.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sand-500 gap-2 text-sm">
          <Loader2 size={18} className="animate-spin text-white" />
          Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-800 bg-ink-900/40 py-12 text-center text-sand-500 text-sm">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => {
            const commentDate = parseDate(comment.createdAt);
            const isAuthor =
              currentUser && currentUser._id === comment.author?._id;
            const isOpen = !!openReplies[comment.id];
            const replies = repliesMap[comment.id] || [];
            const isLoadingReplies = !!loadingReplies[comment.id];
            const isReplying = replyingToCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className="group relative rounded-2xl border border-ink-800/80 bg-ink-900/60 p-5 transition-colors hover:border-white/20"
              >
                {/* Top Row: Author & Metadata */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        comment.author?.avatarUrl ||
                        "https://picsum.photos/seed/user/64/64"
                      }
                      alt={comment.author?.name || "Founder"}
                      className="h-9 w-9 rounded-full object-cover border border-ink-700/60"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-sand-100">
                        {comment.author?.name || "Founder"}
                      </h4>
                      <p className="text-[11px] text-sand-500">
                        {commentDate ? timeAgo(commentDate) : "just now"}
                      </p>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-sand-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Comment Body */}
                <p className="mt-3.5 text-sm leading-relaxed text-sand-300 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Bottom Actions Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium">
                  {currentUser && (
                    <button
                      onClick={() => {
                        if (isReplying) {
                          setReplyingToCommentId(null);
                        } else {
                          setReplyingToCommentId(comment.id);
                          setReplyText("");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-sand-400 hover:text-white transition-colors"
                    >
                      <Reply size={13} />
                      Reply
                    </button>
                  )}

                  {comment.replyCount > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp size={14} />
                          Hide replies
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          View {comment.replyCount}{" "}
                          {comment.replyCount === 1 ? "reply" : "replies"}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Inline Reply Input */}
                {isReplying && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="mb-2 text-xs text-sand-400 flex items-center gap-1">
                      <CornerDownRight size={12} className="text-white/60" />
                      Replying to{" "}
                      <span className="font-semibold text-white">
                        @{comment.author?.name}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply…"
                      className="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-xs text-white placeholder:text-sand-600 focus:border-white/30 focus:outline-none transition-all resize-none"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToCommentId(null)}
                        className="px-3 py-1.5 text-xs text-sand-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingReply || !replyText.trim()}
                        onClick={() =>
                          handleCreateReply(comment.id, comment.author?.name)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-950 hover:bg-sand-200 transition-all disabled:opacity-50"
                      >
                        {submittingReply ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies Section */}
                {isOpen && (
                  <div className="mt-5 space-y-3.5 border-l-2 border-ink-800 pl-4 sm:pl-6 ml-2">
                    {isLoadingReplies ? (
                      <div className="flex items-center gap-2 text-xs text-sand-500 py-2">
                        <Loader2 size={13} className="animate-spin text-white" />
                        Loading replies…
                      </div>
                    ) : replies.length === 0 ? (
                      <p className="text-xs text-sand-600 italic">
                        No replies loaded.
                      </p>
                    ) : (
                      replies.map((reply) => {
                        const replyDate = parseDate(reply.createdAt);
                        const isReplyAuthor =
                          currentUser && currentUser._id === reply.author?._id;

                        return (
                          <div
                            key={reply.id}
                            className="group/reply relative rounded-xl border border-ink-800/60 bg-ink-950/60 p-3.5 transition-colors hover:border-white/15"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    reply.author?.avatarUrl ||
                                    "https://picsum.photos/seed/replyuser/64/64"
                                  }
                                  alt={reply.author?.name || "Founder"}
                                  className="h-7 w-7 rounded-full object-cover border border-ink-700/60"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-sand-100">
                                      {reply.author?.name || "Founder"}
                                    </span>
                                    {reply.replyToUser && (
                                      <span className="text-[10px] text-sand-500">
                                        replying to{" "}
                                        <span className="text-sand-300">
                                          @{reply.replyToUser}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-sand-500">
                                    {replyDate
                                      ? timeAgo(replyDate)
                                      : "just now"}
                                  </p>
                                </div>
                              </div>

                              {isReplyAuthor && (
                                <button
                                  onClick={() =>
                                    handleDeleteReply(comment.id, reply.id)
                                  }
                                  title="Delete reply"
                                  className="opacity-0 group-hover/reply:opacity-100 p-1 text-sand-500 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            <p className="mt-2.5 text-xs leading-relaxed text-sand-300 whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
