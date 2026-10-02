import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import {
  dataGridClassNames,
  dataGridSxStyles,
} from "@/lib/utils";
import {
  useGetTasksQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";
import React from "react";

type Props = {
  id?: string;
  userId?: number;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  showAddTaskButton?: boolean;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) =>
      params.row.author?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) =>
      params.row.assignee?.username || "Unassigned",
  },
];

const TableView = ({
  id,
  userId,
  setIsModalNewTaskOpen,
  showAddTaskButton = true,
}: Props) => {
  const isDarkMode = useAppSelector(
    (state) => state.global.isDarkMode
  );

  // Fetch project tasks
  const {
    data: projectTasks,
    error: projectTasksError,
    isLoading: isProjectTasksLoading,
  } = useGetTasksQuery(
    { projectId: Number(id) },
    {
      skip: userId !== undefined || !id,
    }
  );

  // Fetch user tasks
  const {
    data: userTasks,
    error: userTasksError,
    isLoading: isUserTasksLoading,
  } = useGetTasksByUserQuery(userId ?? 0, {
    skip: userId === undefined,
  });

  // Select the appropriate task source
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !tasks) {
    return (
      <div>
        An error occurred while fetching tasks
      </div>
    );
  }

  return (
    <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Table"
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

      <DataGrid
        rows={tasks}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default TableView;