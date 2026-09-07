export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  const colors = isDarkMode
    ? {
        background: "#1d1f21",
        surface: "#101214",
        text: "#e5e7eb",
        mutedText: "#a3a3a3",
        border: "#2d3135",
      }
    : {
        background: "#ffffff",
        surface: "#ffffff",
        text: "#111827",
        mutedText: "#6b7280",
        border: "#e5e7eb",
      };

  return {
    "&.MuiDataGrid-root": {
      color: colors.text,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    "& .MuiDataGrid-main": {
      backgroundColor: colors.background,
    },
    "& .MuiDataGrid-columnHeaders": {
      color: colors.text,
      backgroundColor: colors.surface,
      '& [role="row"] > *': {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    },
    "& .MuiDataGrid-cell": {
      color: colors.text,
      borderColor: colors.border,
    },
    "& .MuiDataGrid-row": {
      backgroundColor: colors.background,
      borderBottom: `1px solid ${colors.border}`,
    },
    "& .MuiDataGrid-footerContainer": {
      color: colors.mutedText,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    "& .MuiIconButton-root": {
      color: colors.mutedText,
    },
    "& .MuiTablePagination-root": {
      color: colors.mutedText,
    },
    "& .MuiTablePagination-selectIcon": {
      color: colors.mutedText,
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: colors.border,
    },
  };
};