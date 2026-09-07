"use client";
import { useGetUsersQuery } from "@/state/api";
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
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={`/${params.value}`}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !users) return <div>Error fetching users</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          getRowId={(row) => row.userId}
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

export default Users;