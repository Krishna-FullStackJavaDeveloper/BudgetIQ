import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Typography,
  MenuItem,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import BackspaceIcon from "@mui/icons-material/Backspace";

const repeatOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const transactionTypes = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

const RecurringTransactions = () => {
  const [form, setForm] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "",
    startDate: "",
    repeatCycle: "monthly",
    repeatDay: "",
    endDate: "",
  });

  const [data, setData] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  useEffect(() => {
    // TODO: Fetch from API
    const dummyData = [
      {
        id: 1,
        type: "expense",
        title: "Netflix",
        amount: 15,
        category: "Subscription",
        startDate: "2025-07-01",
        repeatCycle: "monthly",
        repeatDay: "1",
        endDate: "",
      },
    ];
    setData(dummyData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editIndex !== null) {
      const updated = [...data];
      updated[editIndex] = { ...form, id: updated[editIndex].id };
      setData(updated);
      setEditIndex(null);
    } else {
      setData([...data, { ...form, id: Date.now() }]);
    }

    setForm({
      type: "expense",
      title: "",
      amount: "",
      category: "",
      startDate: "",
      repeatCycle: "monthly",
      repeatDay: "",
      endDate: "",
    });
  };

  const handleCancel = () => {
    // Reset form fields
    setForm({
      type: "expense",
      title: "",
      amount: "",
      category: "",
      startDate: "",
      repeatCycle: "monthly",
      repeatDay: "",
      endDate: "",
    });

    // Reset edit mode
    setEditIndex(null);
  };

  const handleEdit = (index: number) => {
    setForm(data[index]);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = [...data];
    updated.splice(index, 1);
    setData(updated);
  };

  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 4,
              borderRadius: "20px",
              backdropFilter: "blur(14px)",
              background: "rgba(150, 206, 255, 0.2)",
              border: "1px solid rgba(150, 206, 255, 0.4)",
              boxShadow: "0 10px 40px rgba(150, 206, 255, 0.25)",
              color: "#003366",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {editIndex !== null ? "✏️ Edit" : "➕ Add"} Recurring Transaction
            </Typography>

            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
            >
              {transactionTypes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              type="number"
            />

            <TextField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={form.startDate ? dayjs(form.startDate) : null}
                onChange={(newValue) => {
                  setForm({
                    ...form,
                    startDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                  });
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>

            <TextField
              select
              label="Repeat Cycle"
              name="repeatCycle"
              value={form.repeatCycle}
              onChange={handleChange}
              fullWidth
            >
              {repeatOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Repeat Day (1-31 or Monday)"
              name="repeatDay"
              value={form.repeatDay}
              onChange={handleChange}
              fullWidth
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date (optional)"
                value={form.endDate ? dayjs(form.endDate) : null}
                onChange={(newValue) => {
                  setForm({
                    ...form,
                    endDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                  });
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            {/* Button */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: "1 1 160px" }}>
                <Button
                  fullWidth
                  onClick={handleSubmit}
                  variant="outlined"
                  startIcon={
                    editIndex !== null ? (
                      <DriveFileRenameOutlineIcon />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    borderRadius: "10px",
                    color: "#004080",
                    borderColor: "rgba(150, 206, 255, 0.4)",
                    "&:hover": {
                      backgroundColor: "rgba(150, 206, 255, 0.2)",
                      boxShadow: "0 10px 40px rgba(150, 206, 255, 0.25)",
                    },
                    "& .MuiButton-startIcon": {
                      display: "flex",
                      alignItems: "center",
                      marginTop: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      verticalAlign: "middle",
                    },
                  }}
                >
                  {editIndex !== null ? "Update" : "Save Recurring"}
                </Button>
              </Box>

              <Box sx={{ flex: "1 1 160px" }}>
                <Button
                  fullWidth
                  onClick={handleCancel}
                  variant="text"
                  startIcon={<BackspaceIcon />}
                  sx={{
                    py: 1.2,
                    fontWeight: 500,
                    fontSize: "1rem",
                    textTransform: "none",
                    borderRadius: "10px",
                    color: "#cc0000",
                    border: "1px dashed rgba(204, 0, 0, 0.4)",
                    "&:hover": {
                      backgroundColor: "rgba(204, 0, 0, 0.1)",
                      boxShadow: "0 5px 5px rgba(204, 0, 0, 0.25)",
                    },
                    "& .MuiButton-startIcon": {
                      display: "flex",
                      alignItems: "center",
                      marginTop: 0,
                    },
                    "& .MuiSvgIcon-root": {
                      verticalAlign: "middle",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={7}>
          {/* Table */}
          <Grid item xs={12}>
            <Box mt={{ xs: 3, md: 0 }}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  background: "rgba(150, 206, 255, 0.2)",
                  border: "1px dashed rgba(150, 206, 255, 0.4)",
                  boxShadow: "0 10px 40px rgba(150, 206, 255, 0.25)",
                  color: "#004080",
                  // maxWidth: 400,
                  mx: "auto",
                  mb: 3,
                  maxHeight: 450,
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  💡 Tips for Managing Recurring Transactions
                </Typography>
                <Typography
                  mt={1}
                  fontSize="0.95rem"
                  sx={{ color: "#336699", marginLeft: 4 }}
                >
                  - You can edit or delete entries any time.
                  <br />
                  - Use categories wisely to track spending habits.
                  <br />- Keep an eye on overlapping subscriptions to avoid
                  surprises.
                </Typography>
              </Card>
            </Box>

            <Card
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "rgba(150, 206, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(150, 206, 255, 0.2)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                color: "#003366",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
                sx={{ color: "#004080" }}
              >
                📋 Recurring Transactions
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ background: "transparent" }}
              >
                <Table>
                  <TableHead
                    sx={{ backgroundColor: "rgba(150, 206, 255, 0.25)" }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Title
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Amount
                      </TableCell>
                      {/* <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Repeat
                      </TableCell> */}
                      <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Start
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#004080" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>${item.amount}</TableCell>
                        {/* <TableCell>
                          {item.repeatCycle} / {item.repeatDay}
                        </TableCell> */}
                        <TableCell>{item.startDate}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEdit(idx + page * rowsPerPage)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleDelete(idx + page * rowsPerPage)
                            }
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecurringTransactions;
