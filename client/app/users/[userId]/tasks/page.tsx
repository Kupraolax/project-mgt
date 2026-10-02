"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

import Header from "@/components/Header";
import BoardView from "@/app/projects/BoardView";
import ListView from "@/app/projects/ListView";
import TableView from "@/app/projects/TableView";

type ViewType = "Board" | "List" | "Table";

const UserTasksPage = () => {
  const params = useParams();

  const userId = Number(params.userId);

  const [activeView, setActiveView] =
    useState<ViewType>("Board");

  const [
    isModalNewTaskOpen,
    setIsModalNewTaskOpen,
  ] = useState(false);

  if (Number.isNaN(userId)) {
    return <div>Invalid user ID</div>;
  }

  return (
    <div className="flex w-full flex-col">
      <div className="p-8 pb-2">
        <Header name="User Tasks" />

        <div className="mt-4 flex gap-2">
          {(["Board", "List", "Table"] as ViewType[]).map(
            (view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`rounded px-4 py-2 text-sm font-medium ${
                  activeView === view
                    ? "bg-blue-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-secondary dark:text-gray-200"
                }`}
              >
                {view}
              </button>
            )
          )}
        </div>
      </div>

      {activeView === "Board" && (
        <BoardView
            userId={userId}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            showAddTaskButton={false}
        />
     )}

      {activeView === "List" && (
        <ListView
            userId={userId}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            showAddTaskButton={false}
        />
     )}

      {activeView === "Table" && (
        <TableView
            userId={userId}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            showAddTaskButton={false}
        />
        )}
    </div>
    );
};

export default UserTasksPage;
