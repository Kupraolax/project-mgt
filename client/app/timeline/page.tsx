"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type TaskTypeItems = "task" | "milestone" | "project";

const TaskListHeader = ({
  headerHeight,
}: {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}) => {
  return (
    <div
      className="flex border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-secondary"
      style={{ height: headerHeight }}
    >
      <div className="flex w-[120px] items-center border-r px-3">
        Name
      </div>

      <div className="flex w-[120px] items-center border-r px-3">
        From
      </div>

      <div className="flex w-[120px] items-center border-r px-3">
        To
      </div>

      <div className="flex w-[90px] items-center justify-center px-3">
        Progress
      </div>
    </div>
  );
};

const TaskListTable = ({
  tasks,
  rowHeight,
  selectedTaskId,
  setSelectedTask,
}: {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: any[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
}) => {
  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex border-b border-gray-200 dark:border-gray-700 ${
            selectedTaskId === task.id
              ? "bg-gray-100 dark:bg-gray-700"
              : "bg-white dark:bg-dark-secondary"
          }`}
          style={{ height: rowHeight }}
          onClick={() => setSelectedTask(task.id)}
        >
          <div className="flex w-[120px] items-center overflow-hidden border-r px-3">
            <span className="truncate">
              {task.name}
            </span>
          </div>

          <div className="flex w-[120px] items-center overflow-hidden border-r px-3">
            <span className="truncate">
              {task.start.toLocaleDateString()}
            </span>
          </div>

          <div className="flex w-[120px] items-center overflow-hidden border-r px-3">
            <span className="truncate">
              {task.end.toLocaleDateString()}
            </span>
          </div>

          <div className="flex w-[90px] items-center justify-center font-semibold">
            {task.progress}%
          </div>
        </div>
      ))}
    </div>
  );
};

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      projects?.map((project) => ({
        start: new Date(project.startDate as string),
        end: new Date(project.endDate as string),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: project.progress ?? 0,
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !projects)
    return <div>An error occurred while fetching projects</div>;

  return (
    <div className="max-w-full p-8">
      <header className="mb-4 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={
              displayOptions.viewMode === ViewMode.Month ? 150 : 100
            }

            listCellWidth="450px"

            TaskListHeader={TaskListHeader}
            TaskListTable={TaskListTable}

            projectBackgroundColor={
              isDarkMode ? "#101214" : "#1f2937"
            }
            projectProgressColor={
              isDarkMode ? "#1f2937" : "#aeb8c2"
            }
            projectProgressSelectedColor={
              isDarkMode ? "#000" : "#9ba1a6"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;