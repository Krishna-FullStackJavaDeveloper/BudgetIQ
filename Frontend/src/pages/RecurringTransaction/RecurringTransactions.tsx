import React, { useState, useEffect, useRef } from "react";
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
  TableSortLabel,
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
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  getAllRecurringByUser,
  updateRecurringTransaction,
} from "../../api/recurringTransactionApi";
import { RecurringTransactionForm } from "../../components/Interface/RecurringTransactionForm";

const repeatOptions = [
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const transactionTypes = [
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
];

function parseCustomDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === "N/A") return ""; // no date
  // Extract only the date part before comma, e.g. "01-06-2025"
  const datePart = dateStr.split(",")[0].trim();
  // Parse with dayjs using the format "DD-MM-YYYY"
  const parsed = dayjs(datePart, "DD-MM-YYYY");
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}

const RecurringTransactions = () => {
  const [form, setForm] = useState<RecurringTransactionForm>({
    type: "EXPENSE",
    title: "",
    amount: "",
    category: "",
    startDate: "",
    repeatCycle: "MONTHLY",
    repeatDay: "",
    endDate: "",
  });

  const [data, setData] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalRows, setTotalRows] = useState(0);
  const [sort, setSort] = useState("createdAt,desc");
  const didFetchRef = useRef(false);

  const fetchRecurringTransactions = async (
    pageNumber: number = 0,
    pageSize: number = rowsPerPage,
    sort: string = "createdAt,desc"
  ) => {
    try {
      const res = await getAllRecurringByUser({
        page: pageNumber,
        size: pageSize,
        sort,
      });
      if (res && res.data && Array.isArray(res.data.content)) {
        setData(res.data.content);
        setTotalRows(res.data.page.totalElements); // <-- fix here to get total elements
        setPage(res.data.page.number); // <-- sync current page from backend
        setRowsPerPage(res.data.page.size); // <-- sync page size from backend
      }
    } catch (error) {
      console.error("Failed to fetch recurring transactions", error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (!didFetchRef.current) {
      fetchRecurringTransactions(0, rowsPerPage, sort);
      didFetchRef.current = true;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For title field: max 20 characters
    if (name === "title" && value.length > 20) return;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (editIndex !== null) {
        // Update existing
        const itemToUpdate = data[editIndex];
        await updateRecurringTransaction(itemToUpdate.id, {
          ...form,
          amount: parseFloat(form.amount),
          // repeatDay: parseInt(form.repeatDay),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        // Refresh list
        await fetchRecurringTransactions();
        setEditIndex(null);
      } else {
        // Add new
        await addRecurringTransaction({
          ...form,
          amount: parseFloat(form.amount),
          // repeatDay: parseInt(form.repeatDay),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        // Refresh list
        await fetchRecurringTransactions();
      }

      setForm({
        type: "EXPENSE",
        title: "",
        amount: "",
        category: "",
        startDate: "",
        repeatCycle: "MONTHLY",
        repeatDay: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleCancel = () => {
    setForm({
      type: "EXPENSE",
      title: "",
      amount: "",
      category: "",
      startDate: "",
      repeatCycle: "MONTHLY",
      repeatDay: "",
      endDate: "",
    });
    setEditIndex(null);
    clearErrors();
  };

  const handleEdit = (index: number) => {
  const item = data[index];

  if (!item) {
    console.error(`No item found at index ${index}`);
    return;
  }
  setForm({
    type: item.type,
    title: item.title,
    amount: item.amount.toString(),
    category: item.category,
    startDate: parseCustomDate(item.startDate),
    repeatCycle: item.repeatCycle,
    repeatDay: item.repeatDay ? item.repeatDay.toString() : "",
    endDate: parseCustomDate(item.endDate),
  });
  setEditIndex(index);
};

  const handleDelete = async (index: number) => {
    try {
      const item = data[index];
      await deleteRecurringTransaction(item.id);
      await fetchRecurringTransactions();
      if (editIndex === index) {
        handleCancel();
      }
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
    }
  };

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    fetchRecurringTransactions(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    fetchRecurringTransactions(0, newSize);
  };

  // Example: handle column header click
  const handleSortChange = (field: string) => {
    // toggle asc/desc
    let direction = "asc";
    if (sort.startsWith(field) && sort.endsWith("asc")) direction = "desc";
    setSort(`${field},${direction}`);
    fetchRecurringTransactions(page, rowsPerPage, `${field},${direction}`);
  };

  const [errors, setErrors] = useState({
    title: "",
    amount: "",
    startDate: "",
    repeatDay: "",
  });
  const clearErrors = () => {
    setErrors({
      title: "",
      amount: "",
      startDate: "",
      repeatDay: "",
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.length > 20) {
      newErrors.title = "Only 20 characters allowed";
    }

    if (!form.amount.trim()) {
      newErrors.amount = "Amount is required";
    }

    if (!form.startDate.trim()) {
      newErrors.startDate = "Start date is required";
    }
    // Only require repeatDay if repeatCycle is NOT 'daily'
    if (form.repeatCycle !== "DAILY" && !form.repeatDay.trim()) {
      newErrors.repeatDay = "Repeat Day is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
              error={!!errors.title}
              helperText={errors.title}
            />

            <TextField
              label="Amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              type="number"
              error={!!errors.amount}
              helperText={errors.amount}
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
                    startDate:
                      newValue && newValue.isValid()
                        ? newValue.format("YYYY-MM-DD")
                        : "",
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
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
              label={
                form.repeatCycle === "WEEKLY"
                  ? "Repeat Day (e.g. Monday)"
                  : "Repeat Day (1-31)"
              }
              name="repeatDay"
              value={form.repeatDay}
              onChange={handleChange}
              fullWidth
              type={form.repeatCycle === "WEEKLY" ? "text" : "number"}
              error={!!errors.repeatDay}
              helperText={errors.repeatDay}
              disabled={form.repeatCycle === "DAILY"}
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
                  {/* - You can edit or delete entries any time.
                  <br /> */}
                  - Use categories wisely to track spending habits.
                  <br />- Keep an eye on overlapping subscriptions to avoid
                  surprises.
                  <br />- If a scheduled repeat date falls on a weekend or
                  holiday, it will automatically move to the next working day.
                  <br />
                  - "Repeat Cycle" and "Repeat Day" work together:
                  <br /> &nbsp;&nbsp;• Weekly + Monday means the event repeats
                  every Monday.
                  <br /> &nbsp;&nbsp;• Daily means it repeats every day, so
                  "Repeat Day" is ignored.
                  <br /> &nbsp;&nbsp;• Monthly + 20 means it repeats on the 20th
                  <br /> &nbsp;&nbsp;• Yearly repeats on the "repeat day" of the
                  month from the start date every year.{" "}
                  <strong>For example,</strong> if start date is June 1 and
                  repeat day is 20, it repeats on June 20 each year.
                </Typography>
              </Card>
            </Box>

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
                    {[
                      { id: "title", label: "Title" },
                      { id: "type", label: "Type" },
                      { id: "amount", label: "Amount" },
                      // { id: "category", label: "Category" },
                      { id: "repeatCycle", label: "Repeat Cycle" },
                      { id: "actions", label: "Actions", sortable: false },
                    ].map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          fontWeight: 600,
                          color: "#004080",
                          cursor:
                            col.sortable !== false ? "pointer" : "default",
                        }}
                        onClick={() => {
                          if (col.sortable !== false) handleSortChange(col.id);
                        }}
                      >
                        {col.sortable === false ? (
                          col.label
                        ) : (
                          <TableSortLabel
                            active={sort.startsWith(col.id)}
                            direction={sort.endsWith("asc") ? "asc" : "desc"}
                          >
                            {col.label}
                          </TableSortLabel>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "999px",
                              px: 2,
                              py: 0.5,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              textTransform: "capitalize",
                              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
                              transition: "all 0.3s ease-in-out",
                              cursor: "default",
                              bgcolor:
                                item.type === "INCOME" ? "#e6f4ea" : "#fdecea",
                              color:
                                item.type === "INCOME" ? "#2e7d32" : "#c62828",
                              border: "1px solid",
                              borderColor:
                                item.type === "INCOME" ? "#81c784" : "#ef9a9a",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            {item.type === "INCOME" ? "Income" : "Expense"}
                          </Box>
                        </TableCell>
                        <TableCell>${item.amount}</TableCell>
                        {/* <TableCell>{item.category}</TableCell> */}
                        <TableCell>
                          {item.repeatCycle} |{" "}
                          {item.repeatDay && item.repeatDay.trim()
                            ? item.repeatDay
                            : "N/A"}{" "}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEdit(idx)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleDelete(idx)
                            }
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[2, 4, 5, 10, 25]}
                component="div"
                count={totalRows}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecurringTransactions;
