import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Typography,
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
  Checkbox,
  FormControlLabel,
  CircularProgress,
  TableSortLabel,
  TableFooter,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { GoalResponse } from "../../components/Interface/goalTypes";
import { useGoalService } from "../../service/goalService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function parseCustomDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === "N/A") return ""; // no date
  // Extract only the date part before comma, e.g. "01-06-2025"
  const datePart = dateStr.split(",")[0].trim();
  // Parse with dayjs using the format "DD-MM-YYYY"
  const parsed = dayjs(datePart, "DD-MM-YYYY");
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}

const AddGoalTransactionPage: React.FC = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  // Transaction list
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goal, setGoal] = useState<GoalResponse | null>(null);
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Form state (include your extra fields)
  const [form, setForm] = useState({
    amount: "",
    date: "",
    sourceNote: "",
    manuallyAdded: true,
    autoTransferred: false,
  });

  // Editing index (null means add mode)
  const [editIndex, setEditIndex] = useState<number | null>(null);

  //Sorting
  const [orderBy, setOrderBy] = useState<
    | keyof typeof form
    | "date"
    | "amount"
    | "sourceNote"
    | "manuallyAdded"
    | "autoTransferred"
  >("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const isFormIncomplete = !form.amount || !form.date;
  const isGoalAchievedAndAdding = editIndex === null && goal?.achieved;
  const isButtonDisabled =
    loading || isFormIncomplete || isGoalAchievedAndAdding;

  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getGoalById,
    getTransactionsByGoalId,
  } = useGoalService();

  // Fetch goal details and transactions on load
  useEffect(() => {
    if (goalId) {
      fetchGoal();
      fetchTransactions();
    }
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      const res: { data: GoalResponse } = await getGoalById(Number(goalId));
      setGoal(res.data);
    } catch (err) {
      console.error("Error fetching goal:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await getTransactionsByGoalId(Number(goalId));
      // Sort descending by date
      const sorted = res.data.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let fieldValue: string | boolean = value;

    if (type === "checkbox") {
      // checked only exists on checkbox inputs
      fieldValue = (e.target as HTMLInputElement).checked;
    }

    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  // Reset form & edit state
  const resetForm = () => {
    setForm({
      amount: "",
      date: "",
      sourceNote: "",
      manuallyAdded: true,
      autoTransferred: false,
    });
    setEditIndex(null);
  };

  // Add new transaction
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      alert("Amount and Date are required");
      return;
    }
    try {
      setLoading(true);
      await addTransaction({
        goalId: Number(goalId),
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
        sourceNote: form.sourceNote,
        manuallyAdded: form.manuallyAdded,
        autoTransferred: form.autoTransferred,
      });
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit transaction: load selected transaction into form
  const handleEdit = (index: number) => {
    const txn = transactions[index];
    setEditIndex(index);
    setForm({
      amount: txn.amount.toString(),
      date: txn.date.split("T")[0],
      // date: parseCustomDate(txn.date),
      sourceNote: txn.sourceNote || "",
      manuallyAdded: txn.manuallyAdded ?? true,
      autoTransferred: txn.autoTransferred ?? false,
    });
  };

  // Update transaction
  const handleUpdate = async () => {
    // console.log("update");
    if (editIndex === null) return;
    if (!form.amount || !form.date) {
      alert("Amount and Date are required");
      return;
    }
    try {
      setLoading(true);
      const txn = transactions[editIndex];
      await updateTransaction(txn.id, {
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
        sourceNote: form.sourceNote,
        manuallyAdded: form.manuallyAdded,
        autoTransferred: form.autoTransferred,
      });
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error("Failed to update transaction:", err);
      alert("Failed to update transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const handleDelete = async (txnId: number) => {
    // console.log("delete");
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      setLoading(true);
      await deleteTransaction(txnId);
      if (editIndex !== null) resetForm();
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // sort transaction
  const sortTransactions = (array: any[]) => {
    return array.slice().sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      // Special handling for some fields
      if (orderBy === "date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (orderBy === "amount") {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      } else if (typeof aVal === "boolean") {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedTransactions = sortTransactions(transactions);

  const handleRequestSort = (property: typeof orderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0); // reset to first page on sort change
  };

  const displayedTransactions = sortedTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // oldest first in chart
  const chartData = transactions
    .map((txn) => ({
      date: dayjs(txn.date).utc().format("DD-MMMM-YYYY"),
      amount: txn.amount,
    }))
    .reverse();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = dayjs(label).format("DD-MMMM-YYYY | dddd");
      return (
        <Box
          sx={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#004080", fontWeight: "bold" }}
          >
            {dateLabel}
          </Typography>
          <Typography variant="body2">
            ${payload[0].value.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Transactions Table */}
        <Grid item xs={12} md={7}>
          <Typography
            variant="h6"
            fontWeight={600}
            mb={3}
            sx={{ color: "#004080" }}
          >
            Transactions for Goal:{" "}
            <Link
              to="/savingGoals"
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              {goal?.title}
            </Link>
          </Typography>
          <Paper sx={{ mb: 3 }}>
            <TableContainer sx={{ background: "transparent", mb: 2 }}>
              <Table size="medium">
                <TableHead
                  sx={{ backgroundColor: "rgba(150, 206, 255, 0.25)" }}
                >
                  <TableRow>
                    <TableCell
                      sortDirection={orderBy === "date" ? order : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "date"}
                        direction={orderBy === "date" ? order : "asc"}
                        onClick={() => handleRequestSort("date")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={orderBy === "amount" ? order : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "amount"}
                        direction={orderBy === "amount" ? order : "asc"}
                        onClick={() => handleRequestSort("amount")}
                      >
                        Amount
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={orderBy === "sourceNote" ? order : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "sourceNote"}
                        direction={orderBy === "sourceNote" ? order : "asc"}
                        onClick={() => handleRequestSort("sourceNote")}
                      >
                        Note
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "default",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {displayedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTransactions.map((txn, idx) => (
                      <TableRow key={txn.id}>
                        <TableCell>{txn.date.split("T")[0]}</TableCell>
                        <TableCell>${txn.amount.toFixed(2)}</TableCell>
                        <TableCell>{txn.sourceNote || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleEdit(page * rowsPerPage + idx)}
                            size="small"
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(txn.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {/* ✅ Add this footer for pagination */}
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5]}
                      count={transactions.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      colSpan={4}
                      sx={{
                        ".MuiTablePagination-toolbar": {
                          justifyContent: "flex-end", // Align pagination to right
                          pr: 2,
                        },
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Form */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 6,
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {editIndex !== null ? "Edit Transaction" : "Add Transaction"}
            </Typography>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editIndex !== null ? handleUpdate() : handleAdd(e);
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date"
                  value={form.date ? dayjs(form.date) : null}
                  disabled={editIndex === null && goal?.achieved}
                  onChange={(newValue) => {
                    setForm({
                      ...form,
                      date:
                        newValue && newValue.isValid()
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>

              <TextField
                label="Amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ mt: 2 }}
                disabled={editIndex === null && goal?.achieved}
              />
              <TextField
                label="Source Note"
                name="sourceNote"
                value={form.sourceNote}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
                disabled={editIndex === null && goal?.achieved}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="manuallyAdded"
                    checked={form.manuallyAdded}
                    onChange={handleChange}
                    disabled={editIndex === null && goal?.achieved}
                  />
                }
                label="Manually Added"
                sx={{ mt: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="autoTransferred"
                    checked={form.autoTransferred}
                    onChange={handleChange}
                    disabled={editIndex === null && goal?.achieved}
                  />
                }
                label="Auto Transferred"
                sx={{ mt: 1 }}
              />

              {editIndex === null && goal?.achieved && (
                <Typography
                  variant="body2"
                  color="error"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Goal is achieved. You cannot add new transactions.
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isButtonDisabled}
                sx={{ mt: 3 }}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : editIndex !== null ? (
                  "Update Transaction"
                ) : (
                  "Add Transaction"
                )}
              </Button>

              {/* Show error messages below the button */}
              {!isGoalAchievedAndAdding && isFormIncomplete && (
                <Typography
                  variant="body2"
                  color="error"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Amount and Date are required.
                </Typography>
              )}

              {editIndex !== null && (
                <Button
                  variant="text"
                  onClick={resetForm}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </Grid>
      </Grid>

      {/* 📈 Day-wise Line Chart */}
      <Box mt={5} mb={3}>
        <Typography
          variant="h6"
          fontWeight={600}
          mb={2}
          sx={{ color: "#004080" }}
        >
          Daily Transaction Graph
          {/* : <ins>{goal?.title}</ins> */}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#1976d2"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default AddGoalTransactionPage;
