import React, { JSX, useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Stack,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip as MuiTooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import {
  Edit,
  Delete,
  CheckCircle,
  Add,
  Home,
  Subscriptions,
  MonetizationOn,
  TrendingDown,
  TrendingUp,
  CurrencyExchange,
  Close,
  ShoppingCart,
  School,
  LocalGroceryStore,
  Brush,
  Fastfood,
  Language,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loader from "../../components/common/Loader";
import { getAllCategories } from "../../api/category";
import * as MuiIcons from "@mui/icons-material";

interface Category {
  id: number;
  name: string;
  iconName: string;
  color: string;
}

const transactions = [
  { id: 1, name: "Shopping", amount: 1200, category: "shopping" },
  { id: 2, name: "Stationary", amount: 15, category: "stationary" },
  { id: 3, name: "Groceries", amount: 230, category: "groceries" },
  { id: 4, name: "Art Supply", amount: 200, category: "art" },
  { id: 5, name: "Uber Eats", amount: 35, category: "food" },
];

const recentTransactions = transactions.slice(-4);

const data = [
  { name: "Jan", income: 2000, expense: 800, saving: 1200 },
  { name: "Feb", income: 2500, expense: 1500, saving: 1000 },
  { name: "Mar", income: 2200, expense: 1200, saving: 1000 },
  { name: "Apr", income: 2200, expense: 1200, saving: 1000 },
];

const recurringTransactions = [
  {
    category: "Rent",
    description: "Monthly House Rent",
    amount: "$1200",
    dueDate: "April 5, 2025",
    icon: <Home sx={{ color: "#3B48E0" }} />,
  },
  {
    category: "Subscription",
    description: "Netflix Premium",
    amount: "$15",
    dueDate: "April 10, 2025",
    icon: <Subscriptions sx={{ color: "#D32F2F" }} />,
  },
  // import LanguageIcon from '@mui/icons-material/Language';
  {
    category: "Bill",
    description: "Internet Bill",
    amount: "$45",
    dueDate: "April 28, 2025",
    icon: <Language sx={{ color: "#1565C0" }} />,
  },
];

const UserDashboard = () => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null); // Set state to Dayjs or null

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const hasFetched = useRef(false);

  const handleAddExpense = () => {
    if (!amount || !category || !date) {
      alert("Please fill out all fields");
      return;
    }
    // Proceed with adding the expense
    const newTransaction = {
      id: new Date().getTime(),
      name: category,
      amount: parseFloat(amount), // Ensure amount is treated as a number
    };
    console.log("Expense Added:", { amount, category, date });
    setOpen(false); // Close the dialog
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  type StatCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: string;
  };

  const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
      <Typography variant="h6" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </Card>
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Ensure fetch happens only once
        if (!hasFetched.current) {
          hasFetched.current = true;

          const data = await getAllCategories(0, 100, "name");
          if (data.data && Array.isArray(data.data.content)) {
            setCategoryList(data.data.content); // Set categories state
          } else {
            setCategoryList([]); // Fallback to empty list
          }
        }
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategoryList([]); // Fallback to empty list
      }
    };
    fetchCategories();

    const timer = setTimeout(() => {
      setLoading(false); // After 1.5 seconds, stop showing the loader
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return <Loader />;
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Avatar */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>K</Avatar>
        <Typography variant="h5" fontWeight={600}>
          Welcome Back, Krishna!
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {dayjs().format("MMMM DD, YYYY")}
        </Typography>
      </Stack>

      {/* Alerts */}
      <Grid container spacing={3}>
        {/* Income and Expense Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MonetizationOn />}
            title="Total Income"
            value="$8,500"
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingDown />}
            title="Total Expense"
            value="$6,000"
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Savings"
            value="$2,500"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CurrencyExchange />}
            title="Currency & Time"
            value="USD | GMT -5"
            color="warning.main"
          />
        </Grid>

        {/* Expenses Chart */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Monthly Income & Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartTooltip
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      const { income, expense, saving } = payload[0].payload;
                      const formattedIncome = new Intl.NumberFormat().format(
                        income
                      );
                      const formattedExpense = new Intl.NumberFormat().format(
                        expense
                      );
                      const formattedSaving = new Intl.NumberFormat().format(
                        saving
                      );
                      return (
                        <div
                          style={{
                            padding: "10px",
                            background: "#333",
                            color: "#fff",
                            borderRadius: "8px",
                            width: "200px",
                            textAlign: "left",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              marginBottom: "5px",
                              textAlign: "center",
                            }}
                          >
                            {label}
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Income:</span>
                            <span style={{ color: "#82CA9D" }}>
                              ${formattedIncome}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Expense:</span>
                            <span style={{ color: "#FB7E41" }}>
                              ${formattedExpense}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Saving:</span>
                            <span style={{ color: "#8884D8" }}>
                              ${formattedSaving}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  {/* <ReferenceLine y={1000} stroke="red" strokeDasharray="3 3" label="Avg Expense" /> */}
                  <Bar
                    dataKey="income"
                    fill="#82CA9D"
                    radius={[10, 10, 0, 0]}
                    name="Income"
                  >
                    <LabelList
                      dataKey="income"
                      position="top"
                      fill="#82CA9D"
                      fontSize={12}
                    />
                  </Bar>
                  <Bar
                    dataKey="expense"
                    fill="#FB7E41"
                    radius={[10, 10, 0, 0]}
                    name="Expense"
                  >
                    <LabelList
                      dataKey="expense"
                      position="top"
                      fill="#FB7E41"
                      fontSize={12}
                    />
                  </Bar>
                  <Bar
                    dataKey="saving"
                    fill="#8884D8"
                    radius={[10, 10, 0, 0]}
                    name="Saving"
                  >
                    <LabelList
                      dataKey="saving"
                      position="top"
                      fill="#8884D8"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions List */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              position: "relative",
              height: 380,
              mb: 4,
            }}
          >
            <CardContent sx={{ pb: 9 }}>
              {/* Extra padding for floating button */}
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Transactions
              </Typography>
              {recentTransactions.map((tx) => (
                <Box
                  key={tx.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                    boxShadow: 1,
                    // color: categoryData[tx.category as Category].color, // Type assertion for category
                    // borderLeft: `5px solid ${
                    //   categoryData[tx.category as Category].color
                    // }`, // Set left border color
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Category Icon */}
                    <Box
                    // sx={{
                    //   color: categoryData[tx.category as Category].color,
                    // }}
                    >
                      {/* {categoryData[tx.category as Category].icon} */}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {tx.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#0288D1" }}
                  >
                    ${tx.amount}
                  </Typography>
                </Box>
              ))}
            </CardContent>

            {/* Floating Add Button */}
            <Fab
              color="primary"
              sx={{ position: "absolute", bottom: 20, right: 20, zIndex: 0 }}
              onClick={handleOpen}
              aria-label="Add Expense"
            >
              <Add />
            </Fab>

            {/* Popup Dialog */}

            <Dialog
              open={open}
              onClose={handleClose}
              TransitionComponent={Slide}
              fullWidth
              PaperProps={{
                sx: { borderRadius: 5 }, // Adjust the value as needed
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                  position: "relative",
                }}
              >
                Add Expenditure
                {/* Close Icon Button in the top-right corner */}
                <IconButton
                  sx={{ position: "absolute", right: 8, top: 8 }}
                  onClick={handleClose} // Close the dialog when clicked
                >
                  <Close />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ overflow: "auto", padding: 3 }}>
                {/* Form Container */}
                <Box
                  component="form"
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  {/* Amount Field */}
                  <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment:
                        isFocused || amount ? (
                          <InputAdornment position="start">$</InputAdornment>
                        ) : null,
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    sx={{
                      mt: 2,
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        boxShadow: 2,
                      },
                    }}
                  />
                  {/* Category Dropdown */}
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Category"
                      required
                      sx={{
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          boxShadow: 2,
                        },
                      }}
                      renderValue={(selected) => {
                        const selectedCategory = categoryList.find(
                          (cat) => cat.name === selected
                        );
                        if (selectedCategory) {
                          const IconComponent =
                            MuiIcons[
                              selectedCategory.iconName as keyof typeof MuiIcons
                            ] || MuiIcons.Brush;
                          return (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <IconComponent
                                sx={{
                                  marginRight: 2,
                                  color: selectedCategory.color,
                                }}
                              />
                              <Typography
                                sx={{ color: selectedCategory.color }}
                              >
                                {selectedCategory.name}
                              </Typography>
                            </div>
                          );
                        }
                        return null; // Return nothing if no category is selected
                      }}
                    >
                      {categoryList.length === 0 ? (
                        <MenuItem disabled>No categories available</MenuItem>
                      ) : (
                        categoryList.map((cat) => {
                          const IconComponent =
                            MuiIcons[cat.iconName as keyof typeof MuiIcons] ||
                            MuiIcons.Brush;

                          return (
                            <MenuItem key={cat.id} value={cat.name}>
                              {/* Apply color to the icon and text */}
                              <IconComponent
                                sx={{ marginRight: 2, color: cat.color }}
                              />
                              <Typography sx={{ color: cat.color }}>
                                {cat.name}
                              </Typography>
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>
                  </FormControl>
                  {/* Date Picker */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Select Date"
                      value={date}
                      onChange={(newDate) => setDate(newDate)}
                    />
                  </LocalizationProvider>
                </Box>
              </DialogContent>

              <DialogActions sx={{ mb: 1, paddingRight: 3 }}>
                {/* Add Button */}
                <Button
                  onClick={() => {
                    console.log(`Amount: ${amount}, Category: ${category}`);
                    setAmount(""); // Reset the Amount field
                    setCategory(""); // Reset the Category field
                    setDate(null); // Reset the Date field

                    handleAddExpense(); // Call your existing add expense function here
                  }}
                  color="primary"
                  sx={{ borderRadius: "8px", padding: "6px 16px" }}
                >
                  Add
                </Button>

                {/* Cancel Button */}
                <Button
                  onClick={() => {
                    setAmount(""); // Reset the Amount field
                    setCategory(""); // Reset the Category field
                    setDate(null); // Reset the Date field
                  }}
                  color="secondary"
                  sx={{ borderRadius: "8px", padding: "6px 16px" }}
                >
                  Reset
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Grid>
        {/* Recurring tansaction start */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              // p: 2,
              mb: 3,
              // background: "linear-gradient(135deg, #f5f7fa 30%, #c3cfe2 100%)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                {/* 🔁  */}
                Recurring Transactions
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#8E44AD" }}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Next Due
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recurringTransactions.map((txn, index) => (
                      <TableRow
                        key={txn.category}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#fff",
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "transparent" }}>
                              {txn.icon}
                            </Avatar>
                            {txn.category}
                          </Box>
                        </TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#0288D1" }}
                        >
                          {txn.amount}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          {txn.dueDate}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          <MuiTooltip title="Mark as Paid">
                            <IconButton color="success">
                              <CheckCircle />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Edit">
                            <IconButton color="primary">
                              <Edit />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Delete">
                            <IconButton color="error">
                              <Delete />
                            </IconButton>
                          </MuiTooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
