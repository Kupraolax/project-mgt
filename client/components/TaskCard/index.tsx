import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const imageAttachment = task.attachments?.find((attachment) => {
    const fileName = attachment.fileName?.toLowerCase() || "";

    return [".jpg", ".jpeg", ".png", ".webp"].some((extension) =>
      fileName.endsWith(extension),
    );
  });

  const imageUrl = imageAttachment
    ? imageAttachment.fileURL.startsWith("http")
      ? imageAttachment.fileURL
      : `https://pm-kupra-s3-images.s3.us-east-1.amazonaws.com/${imageAttachment.fileURL}`
    : null;

  return (
    <div className="task-card dark:bg-dark-secondary mb-3 rounded bg-white p-4 shadow dark:text-white">
      {imageAttachment && imageUrl && (
        <div>
          <strong>Attachments:</strong>
          <div className="flex flex-wrap">
            <Image
              src={imageUrl}
              alt={imageAttachment.fileName || "Task attachment"}
              width={400}
              height={200}
              className="rounded-md"
            />
          </div>
        </div>
      )}
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {task.description || "No description provided"}
      </p>
      <p>
        <strong>Status:</strong> {task.status}
      </p>
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>
      <p>
        <strong>Tags:</strong> {task.tags || "No tags"}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Author:</strong>{" "}
        {task.author ? task.author.username : "Unknown"}
      </p>
      <p>
        <strong>Assignee:</strong>{" "}
        {task.assignee ? task.assignee.username : "Unassigned"}
      </p>
    </div>
  );
};

export default TaskCard;
