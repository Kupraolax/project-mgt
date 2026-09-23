"use client";

import React, { useState } from "react";
import {
  Task,
  useAddCommentMutation,
  useGetAuthUserQuery,
} from "@/state/api";
import { X } from "lucide-react";

type Props = {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
};

const ModalTaskDetails = ({ task, isOpen, onClose }: Props) => {
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  const { data: authUser } = useGetAuthUserQuery({});
  const [addComment, { isLoading }] = useAddCommentMutation();

  if (!isOpen) return null;

  const currentUser = authUser?.userDetails;

  const canComment =
  !!currentUser &&
  (currentUser.role === "ADMIN" ||
    task.authorUserId === currentUser.userId ||
    task.assignedUserId === currentUser.userId);

  const handleAddComment = async () => {
    const text = commentText.trim();

    if (!text) {
      setCommentError("Please enter a comment.");
      return;
    }

    try {
      setCommentError("");

      await addComment({
        taskId: task.id,
        text,
      }).unwrap();

      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      setCommentError("Unable to add comment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-dark-secondary dark:text-white">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>

            <p className="mt-1 text-sm text-gray-500">
              Task #{task.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-semibold">Description</h3>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 font-semibold">
            Comments ({task.comments?.length || 0})
          </h3>

          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md bg-gray-100 p-3 dark:bg-gray-700"
                >
                  <div className="mb-1 text-sm font-semibold">
                    {comment.user?.username || `User ${comment.userId}`}
                  </div>

                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No comments yet.
            </p>
          )}
        </div>

        {canComment ? (
          <div className="border-t pt-4 dark:border-gray-700">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-dark-tertiary"
            />

            {commentError && (
              <p className="mt-1 text-sm text-red-500">
                {commentError}
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAddComment}
                disabled={isLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4 text-sm text-gray-500 dark:border-gray-700">
            You can view comments, but only the task author, assignee,
            or an administrator can add comments.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalTaskDetails;