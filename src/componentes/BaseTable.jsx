import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";

const textoPtBr = ptBR.components.MuiDataGrid.defaultProps.localeText;

export default function BaseTable({ rows, columns, getRowId, getRowHeight, loading = false }) {
  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        getRowHeight={getRowHeight}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[20]}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
        localeText={textoPtBr}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": { alignItems: "center" },
        }}
      />
    </Box>
  );
}
