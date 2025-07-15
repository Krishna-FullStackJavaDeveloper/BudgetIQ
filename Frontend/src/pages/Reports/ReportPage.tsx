import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Collapse,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useReportService } from "../../service/reportService";
import { FinancialReportDto } from "../../components/Interface/report";
// Import Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import isoWeek from "dayjs/plugin/isoWeek";
import CustomTooltip from "../../components/layout/CustomTooltip ";
import { useCsvExporter } from "../../hooks/useCsvExporter";
import { getMyFamily } from "../../api/family";
dayjs.extend(isoWeek);

const ReportPage = () => {
  const { getReportSummary, downloadReportPdf, sendMonthlyReportToFamily } =
    useReportService();

  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs().subtract(1, "month")
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FinancialReportDto | null>(null);
  const [transactions, setTransactions] = useState<FinancialReportDto | null>(
    null
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "source" | "type">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortedTransactions, setSortedTransactions] = useState<any[]>([]);

  const [familyMembers, setFamilyMembers] = useState<
    { username: string; email: string }[]
  >([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [lastFetchedRange, setLastFetchedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const fetchInProgress = useRef(false);

  const handleFetch = async () => {
    if (!startDate || !endDate) return;

    // Format dates as ISO strings for comparison
    const currentStart = startDate.toISOString();
    const currentEnd = endDate.toISOString();

    // If the date range is same as last fetch, do nothing
    if (
      lastFetchedRange?.start === currentStart &&
      lastFetchedRange?.end === currentEnd
    ) {
      // Optional: Show notification or just return silently
      return;
    }

    setLoading(true);
    try {
      // Call just one API instead of two, since response is same
      const response = await getReportSummary(currentStart, currentEnd);

      setReportData(response.data);
      setTransactions(response.data); // assuming same response structure for both

      // Combine incomes and expenses with type tags
      const combined = [
        ...(response.data.incomes?.map((i: any) => ({
          ...i,
          type: "Income",
        })) || []),
        ...(response.data.expenses?.map((e: any) => ({
          ...e,
          type: "Expense",
        })) || []),
      ];

      combined.sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPage(0); // reset page
      setSortedTransactions(combined);

      // Update last fetched range
      setLastFetchedRange({ start: currentStart, end: currentEnd });
    } catch (err) {
      setReportData(null);
      setTransactions(null);
      setSortedTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) return;
    await downloadReportPdf(startDate.toISOString(), endDate.toISOString());
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (iso: string) => dayjs(iso).format("YYYY-MM-DD");

  const handleSort = (column: "date" | "amount" | "source" | "type") => {
    const isAsc = sortBy === column && sortOrder === "asc";
    setSortBy(column);
    setSortOrder(isAsc ? "desc" : "asc");

    const sorted = [...sortedTransactions].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (column) {
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case "amount":
          aVal = a.amount;
          bVal = b.amount;
          break;
        case "source":
          // use source or category (whichever is present)
          aVal = (a.source || a.category || "").toLowerCase();
          bVal = (b.source || b.category || "").toLowerCase();
          break;
        case "type":
          aVal = a.type.toLowerCase();
          bVal = b.type.toLowerCase();
          break;
        default:
          aVal = "";
          bVal = "";
      }

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });

    setSortedTransactions(sorted);
  };

  const fetchInitialData = async () => {
    if (!startDate || !endDate) return;

    // If a fetch is already running, skip this call
    if (fetchInProgress.current) return;

    fetchInProgress.current = true; // Lock fetch

    const currentStart = startDate.toISOString();
    const currentEnd = endDate.toISOString();

    setLoading(true);
    try {
      const response = await getReportSummary(currentStart, currentEnd);
      setReportData(response.data);
      setTransactions(response.data);

      const combined = [
        ...(response.data.incomes?.map((i: any) => ({
          ...i,
          type: "Income",
        })) || []),
        ...(response.data.expenses?.map((e: any) => ({
          ...e,
          type: "Expense",
        })) || []),
      ];

      combined.sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPage(0);
      setSortedTransactions(combined);

      setLastFetchedRange({ start: currentStart, end: currentEnd });
    } catch {
      setReportData(null);
      setTransactions(null);
      setSortedTransactions([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false; // Release lock
    }
  };

  //   Chart data
  const chartData = React.useMemo(() => {
    if (!sortedTransactions.length || !startDate || !endDate) return [];

    // Check if start and end dates are in the same month & year
    const sameMonth =
      startDate.year() === endDate.year() &&
      startDate.month() === endDate.month();

    // Aggregate map: key -> {income, expense}
    const aggregationMap: Record<string, { income: number; expense: number }> =
      {};

    sortedTransactions.forEach((item) => {
      const d = dayjs(item.date);
      let key = "";

      if (sameMonth) {
        // Calculate week number in month (1-based)
        const weekInMonth = Math.ceil(d.date() / 7);
        key = `Week ${weekInMonth}`;
      } else {
        // Aggregate by month: e.g., "Jun 2025"
        key = d.format("MMM YYYY");
      }

      if (!aggregationMap[key]) aggregationMap[key] = { income: 0, expense: 0 };

      if (item.type === "Income") {
        aggregationMap[key].income += item.amount;
      } else if (item.type === "Expense") {
        aggregationMap[key].expense += item.amount;
      }
    });

    // Sort keys to ensure chronological order (weeks or months)
    const sortedKeys = Object.keys(aggregationMap).sort((a, b) => {
      if (sameMonth) {
        // Sort by week number (extract number from "Week X")
        return (
          parseInt(a.replace("Week ", ""), 10) -
          parseInt(b.replace("Week ", ""), 10)
        );
      } else {
        // Sort by date - parse month-year string
        return dayjs(a, "MMM YYYY").unix() - dayjs(b, "MMM YYYY").unix();
      }
    });

    return sortedKeys.map((key) => ({
      period: key,
      income: aggregationMap[key].income,
      expense: aggregationMap[key].expense,
    }));
  }, [sortedTransactions, startDate, endDate]);

  //  Export CSV
  const { exportToCsv } = useCsvExporter({
    reportData,
    transactions: sortedTransactions,
    chartData,
    formatDate,
  });

  // fetch family member
  const fetchFamilyMembers = async () => {
    try {
      const res = await getMyFamily();
      setFamilyMembers(res.data.activeUsers || []);
    } catch (error) {
      console.error("Failed to fetch family:", error);
    }
  };

  const handleCheckboxChange = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSendReport = async () => {
    if (!startDate || !endDate || selectedEmails.length === 0) {
      alert("Please select at least one recipient and date range.");
      return;
    }

    try {
      await sendMonthlyReportToFamily(
        startDate.toISOString(),
        endDate.toISOString(),
        selectedEmails
      );
      alert("Report sent successfully to selected family members.");
    } catch (error) {
      console.error("Failed to send report:", error);
      alert("Failed to send report.");
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchFamilyMembers();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom mb={3}>
        Financial Report
      </Typography>

      {/* Date Filters */}
      <Box display="flex" gap={2} mb={2}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(date) => setStartDate(date ? date.startOf("day") : null)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(date) => setEndDate(date ? date.endOf("day") : null)}
        />
        <Button variant="contained" onClick={handleFetch}>
          Fetch Report
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : reportData ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="#0D47A1">
              Summary
            </Typography>
            <Box display="flex" gap={4} mt={1}>
              <Box>
                <Typography variant="body2">Total Income</Typography>
                <Typography variant="h6" color="#004D40">
                  ${reportData.totalIncome?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">Total Expense</Typography>
                <Typography variant="h6" color="#B71C1C">
                  ${reportData.totalExpense?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">Net Balance</Typography>
                <Typography variant="h6" color="#E65100">
                  ${reportData.netBalance?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
              <Button onClick={handleDownloadPdf} variant="outlined">
                🖨️ Print Report (PDF)
              </Button>

              <Button variant="outlined" onClick={exportToCsv}>
                📥 Export CSV
              </Button>

              {/* Inline dropdown container (no absolute positioning) */}
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  👨‍👩‍👧‍👦 Send Report to Family
                </Button>

                {/* Inline dropdown panel */}
                <Collapse in={showDropdown} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      maxWidth: 360, // responsive max width
                      width: "100%", // fill parent width
                      boxShadow: 1,
                    }}
                  >
                    <FormGroup>
                      {familyMembers.map((member) => (
                        <FormControlLabel
                          key={member.email}
                          control={
                            <Checkbox
                              checked={selectedEmails.includes(member.email)}
                              onChange={() =>
                                handleCheckboxChange(member.email)
                              }
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">
                                {member.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.email}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>

                    {selectedEmails.length > 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSendReport}
                        sx={{ mt: 2 }}
                      >
                        📤 Send Report
                      </Button>
                    )}
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography mt={2} color="text.secondary">
          🚫 No data found. Please select a different date range and try again.
        </Typography>
      )}

      {sortedTransactions.length > 0 ? (
        <Box mt={4} mb={5}>
          {/* Income & Expense Table */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              📄 Income & Expense Details
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead
                  sx={{ backgroundColor: "rgba(150, 206, 255, 0.25)" }}
                >
                  <TableRow>
                    <TableCell
                      sortDirection={sortBy === "date" ? sortOrder : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={sortBy === "date"}
                        direction={sortBy === "date" ? sortOrder : "asc"}
                        onClick={() => handleSort("date")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>

                    <TableCell
                      sortDirection={sortBy === "source" ? sortOrder : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={sortBy === "source"}
                        direction={sortBy === "source" ? sortOrder : "asc"}
                        onClick={() => handleSort("source")}
                      >
                        Source / Category
                      </TableSortLabel>
                    </TableCell>

                    <TableCell
                      sortDirection={sortBy === "type" ? sortOrder : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={sortBy === "type"}
                        direction={sortBy === "type" ? sortOrder : "asc"}
                        onClick={() => handleSort("type")}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>

                    <TableCell
                      sortDirection={sortBy === "amount" ? sortOrder : false}
                      sx={{
                        fontWeight: 600,
                        color: "#004080",
                        cursor: "pointer",
                      }}
                    >
                      <TableSortLabel
                        active={sortBy === "amount"}
                        direction={sortBy === "amount" ? sortOrder : "asc"}
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          transition: "background-color 0.2s",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.source || item.category}</TableCell>
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
                                item.type === "Income" ? "#e6f4ea" : "#fdecea",
                              color:
                                item.type === "Income" ? "#2e7d32" : "#c62828",
                              border: "1px solid",
                              borderColor:
                                item.type === "Income" ? "#81c784" : "#ef9a9a",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            {item.type === "Income" ? "Income" : "Expense"}
                          </Box>
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              item.type === "Income" ? "#1B5E20" : "#B71C1C",
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
              >
                <Typography variant="body2">
                  Showing {page * rowsPerPage + 1}–
                  {Math.min(
                    (page + 1) * rowsPerPage,
                    sortedTransactions.length
                  )}{" "}
                  of {sortedTransactions.length}
                </Typography>
                <Box display="flex" alignItems="center">
                  <FormControl size="small" sx={{ mr: 2 }}>
                    <InputLabel>Rows</InputLabel>
                    <Select
                      value={rowsPerPage}
                      label="Rows"
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(0);
                      }}
                    >
                      {[5, 10, 15, 20].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                  >
                    Prev
                  </Button>
                  <Button
                    onClick={() =>
                      setPage((prev) =>
                        prev + 1 <
                        Math.ceil(sortedTransactions.length / rowsPerPage)
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      page + 1 >=
                      Math.ceil(sortedTransactions.length / rowsPerPage)
                    }
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </TableContainer>
          </Box>

          {/* Chart below the table */}
          <Box mt={6} sx={{ width: "100%", height: 300 }}>
            <Typography variant="h6" gutterBottom>
              📊 Income and Expense Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#16A085"
                  name="Income"
                  isAnimationActive
                />
                <Bar
                  dataKey="expense"
                  fill="#C0392B"
                  name="Expense"
                  isAnimationActive
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      ) : (
        !loading && (
          <Typography mt={2} color="text.secondary">
            🚫 No data found. Please select a different date range and try
            again.
          </Typography>
        )
      )}
    </Box>
  );
};

export default ReportPage;
