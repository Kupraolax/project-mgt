import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import {
  Task,
  useGetTasksQuery,
  useGetTasksByUserQuery,
} from "@/state/api";

import React from "react";

type Props = {
  id?: string;
  userId?: number;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  showAddTaskButton?: boolean;
};

const ListView = ({
  id,
  userId,
  setIsModalNewTaskOpen,
  showAddTaskButton = true,
}: Props) => {
  // Fetch project tasks when ListView is being used
  // from a project page.
  const {
    data: projectTasks,
    error: projectTasksError,
    isLoading: isProjectTasksLoading,
  } = useGetTasksQuery(
    { projectId: Number(id) },
    {
      skip: userId !== undefined || !id,
    },
  );

  // Fetch user tasks when ListView is being used
  // from a user page.
  const {
    data: userTasks,
    error: userTasksError,
    isLoading: isUserTasksLoading,
  } = useGetTasksByUserQuery(userId ?? 0, {
    skip: userId === undefined,
  });

  const tasks =
    userId !== undefined ? userTasks : projectTasks;

  const isLoading =
    userId !== undefined
      ? isUserTasksLoading
      : isProjectTasksLoading;

  const error =
    userId !== undefined
      ? userTasksError
      : projectTasksError;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="list-view bg-gray-50 px-4 pb-8 text-gray-900 dark:bg-dark-bg dark:text-gray-100 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
          buttonComponent={
            showAddTaskButton ? (
              <button
                className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                onClick={() => setIsModalNewTaskOpen(true)}
              >
                Add Task
              </button>
            ) : undefined
          }
          isSmallText
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task: Task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default ListView;