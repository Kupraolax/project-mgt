"use client";
import { useGetTeamsQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  ExportCsv,
  FilterPanelTrigger,
  GridColDef,
  Toolbar,
} from "@mui/x-data-grid";
import Image from "next/image";
import { Download, Filter } from "lucide-react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <Toolbar className="flex gap-2 border-b border-gray-200 px-2 dark:border-stroke-dark">
    <FilterPanelTrigger
      render={(props) => (
        <button
          {...props}
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          FILTERS
        </button>
      )}
    />
    <ExportCsv
      render={(props) => (
        <button
          {...props}
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          EXPORT
        </button>
      )}
    />
  </Toolbar>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "Team ID", width: 100 },
  { field: "teamName", headerName: "Team Name", width: 200 },
  { field: "productOwnerUsername", headerName: "Product Owner", width: 200 },
  {
    field: "projectManagerUsername",
    headerName: "Project Manager",
    width: 200,
  },
];

const Teams = () => {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !teams) return <div>Error fetching teams</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Teams" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={teams || []}
          columns={columns}
          pagination
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Teams;