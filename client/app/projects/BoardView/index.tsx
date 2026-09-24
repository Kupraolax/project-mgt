import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useGetAuthUserQuery,
} from "@/state/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import ModalTaskDetails from "@/components/ModalTaskDetails";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const { data: authUser } = useGetAuthUserQuery({});
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(
    null,
  );
  const selectedTask =
    tasks?.find((task) => task.id === selectedTaskId) ?? null;

  const currentUser = authUser?.userDetails;

  const canMoveTask = (task: TaskType) => {
    if (!currentUser) return false;

    return (
      currentUser.role === "ADMIN" ||
      task.authorUserId === currentUser.userId ||
      task.assignedUserId === currentUser.userId
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <div className="board-view dark:bg-dark-bg grid grid-cols-1 gap-4 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              canMoveTask={canMoveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              onOpenTask={setSelectedTaskId}
            />
          ))}
        </div>

        {selectedTask && (
          <ModalTaskDetails
            task={selectedTask}
            isOpen={true}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  canMoveTask: (task: TaskType) => boolean;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onOpenTask: (taskId: number) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  canMoveTask,
  setIsModalNewTaskOpen,
  onOpenTask,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 dark:bg-dark-secondary rounded-lg bg-gray-100 py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="board-column-header dark:bg-dark-secondary flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="dark:bg-dark-tertiary ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="dark:bg-dark-tertiary flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task
            key={task.id}
            task={task}
            canDrag={canMoveTask(task)}
            onOpenTask={onOpenTask}
          />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  canDrag: boolean;
  onOpenTask: (taskId: number) => void;
};

const Task = ({ task, canDrag, onOpenTask }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "task",
      item: { id: task.id },
      canDrag,
      collect: (monitor: any) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [task.id, canDrag],
  );

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

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

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-200"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-200"
            : priority === "Medium"
              ? "bg-green-200 text-green-700 dark:bg-green-950 dark:text-green-200"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                : "dark:bg-dark-tertiary bg-gray-200 text-gray-700 dark:text-gray-200"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`dark:border-stroke-dark dark:bg-dark-secondary mb-4 rounded-md border border-gray-200 bg-white shadow ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${canDrag ? "cursor-grab" : "cursor-not-allowed"}`}
    >
      {imageAttachment && imageUrl && (
        <Image
          src={imageUrl}
          alt={imageAttachment.fileName || "Task attachment"}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                >
                  {" "}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500">
            <EllipsisVertical size={26} />
          </button>
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-400">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-300">
          {task.description}
        </p>
        <div className="dark:border-stroke-dark mt-4 border-t border-gray-200" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              <Image
                key={`assignee-${task.assignee.userId}`}
                src={`https://pm-kupra-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="dark:border-dark-secondary h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            )}

            {task.author && (
              <Image
                key={`author-${task.author.userId}`}
                src={`https://pm-kupra-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="dark:border-dark-secondary h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            )}
          </div>

          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTask(task.id);
              }}
              className="flex items-center gap-1 rounded px-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="View comments"
            >
              <MessageSquareMore size={20} />
              <span>{numberOfComments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
