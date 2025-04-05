import React, { JSX, useState } from "react";
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
  PieChart,
  Pie,
  Cell,
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
  AccessAlarm,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from 'dayjs'; // Import Dayjs if using Dayjs
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


const transactions = [
  { id: 1, name: "Shopping", amount: 1200, category: "shopping" },
  { id: 2, name: "Stationary", amount: 15, category: "stationary" },
  { id: 3, name: "Groceries", amount: 230, category: "groceries" },
  { id: 4, name: "Art Supply", amount: 200, category: "art" },
  { id: 5, name: "Uber Eats", amount: 35, category: "food" },
];
// Define category icons and colors with an explicit type for the keys
type Category = "shopping" | "stationary" | "groceries" | "art" | "food";

const categoryData: Record<Category, { icon: JSX.Element; color: string }> = {
  shopping: { icon: <ShoppingCart />, color: "#FF5722" },
  stationary: { icon: <School />, color: "#2196F3" },
  groceries: { icon: <LocalGroceryStore />, color: "#4CAF50" },
  art: { icon: <Brush />, color: "#9C27B0" },
  food: { icon: <Fastfood />, color: "#FF9800" },
};

const AdminData = {
  totalFamily: 3,
  totalMembers: 20,
  familyAdmin: 3,
  activeUsers: 14,
};

const familyMemberData = [
  { familyName: 'Bhatt Family', totalSize: 8, activeUsers: 5, inactiveUser:2, suspendedUser: 1 },
  { familyName: 'Family 2', totalSize: 10, activeUsers: 4, inactiveUser:4, suspendedUser: 2 },
  { familyName: 'Pandya Family', totalSize: 7, activeUsers: 5, inactiveUser:2, suspendedUser: 0 },
  { familyName: 'Family 3', totalSize: 8, activeUsers: 5, inactiveUser:2, suspendedUser: 1 },
  { familyName: 'Dave Family', totalSize: 7, activeUsers: 5, inactiveUser:2, suspendedUser: 0 },
  { familyName: 'Family 4', totalSize: 10, activeUsers: 4, inactiveUser:4, suspendedUser: 2 },
];

// Colors for each slice
const COLORS = {active:'#9FA8DA', inactive: '#CE93D8', suspended:'#F48FB1'};

const recentTransactions = transactions.slice(-4);

const data = [
  { name: "Jan", income: 2000, expense: 800 },
  { name: "Feb", income: 2500, expense: 1500 },
  { name: "Mar", income: 2200, expense: 1200 },
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
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null); // Set state to Dayjs or null

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFocused, setIsFocused] = useState(false);
  const handleEditFamily = () => navigate("/edit-family");

  const handlePieClick = () => {
    // Redirect to /manage-users
    navigate('/manage-users');
  };
  
  const handleCardClick = () => {
    navigate('/expense'); // Redirect to the Expense page
  };

  const handleAddExpense = () => {
    if (!amount || !category || !date || !purpose) {
      alert("Please fill out all fields");
      return;
    }
    // Proceed with adding the expense
    const newTransaction = {
      id: new Date().getTime(),
      name: category,
      amount: parseFloat(amount), // Ensure amount is treated as a number
    };
    console.log("Expense Added:", { amount, category, date, purpose });
    setOpen(false); // Close the dialog
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

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

      {/* Moderator Card */}
      <Grid container spacing={3}>
          {/* Family Details Section */}
          <Grid item xs={12} md={3} >
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4 }} >
            <Typography variant="body2" color="success.main" sx={{ mt: 1, mb: 3 }}>
              Welcome, Admin! You have full control over this Family's settings and management.
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Total Family: <strong>{AdminData.totalFamily}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Total Members: <strong>{AdminData.totalMembers}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Currenly Active Members: <strong>{AdminData.activeUsers}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 , mb: 1}}>
              Family Admin: <strong>{AdminData.familyAdmin}</strong>
            </Typography>
          </Card>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, mt: 4.5 }} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <Typography variant="body2" color="#4527A0" sx={{ display: 'flex', alignItems: 'center' }}>
        <AccessAlarm sx={{ mr: 1 }} /> {/* Icon */}
        View Expenses {/* Label */}
      </Typography>
    </Card>
      </Grid>

      <Grid item xs={12} md={9}>
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h6" fontWeight={600}>
          User Analisys
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={familyMemberData} onClick={handlePieClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="familyName" />
            <YAxis />
            <RechartTooltip  
              content= {({ payload, label }) => {
                if (!payload || payload.length === 0) return null;
              
                const { activeUsers, inactiveUser, suspendedUser, totalSize } = payload[0].payload;
              
                return (
                  <div
                    style={{
                      padding: "12px",
                      background: "#333",
                      color: "#fff",
                      borderRadius: "8px",
                      width: "200px",
                      textAlign: "left",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
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
                        marginBottom: "5px",
                      }}
                    >
                      <span>Active Users:</span>
                      <span style={{ color: COLORS.active }}>{activeUsers}</span>
                    </div>
              
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <span>Inactive Users:</span>
                      <span style={{ color: COLORS.inactive }}>{inactiveUser}</span>
                    </div>
              
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Suspended Users:</span>
                      <span style={{ color: COLORS.suspended }}>{suspendedUser}</span>
                    </div>
                  </div>
                );
              }}
            />
          
            {/* Active Users Bar */}
        <Bar
          dataKey="activeUsers"
          stackId="a"
          fill={COLORS.active}
          name="Active Users"
        >
          <LabelList
            dataKey="totalSize"
            position="top"
            fill="#43A047"
            fontSize={12}
          />
        </Bar>

        {/* Inactive Users Bar */}
        <Bar
          dataKey="inactiveUser"
          stackId="a"
          fill={COLORS.inactive}
          name="Inactive Users"
        >
          <LabelList
            dataKey="totalSize"
            position="top"
            fill="#43A047"
            fontSize={12}
          />
        </Bar>

        {/* Suspended Users Bar */}
        <Bar
          dataKey="suspendedUser"
          stackId="a"
          fill={COLORS.suspended}
          name="Suspended Users"
        >
          <LabelList
            dataKey="totalSize"
            position="top"
            fill="#43A047"
            fontSize={12}
          />
        </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Grid>

        {/* Financial Summary */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {[
              {
                icon: <MonetizationOn />,
                label: "$8,500 Total Income",
                color: "#16A085",
              },
              {
                icon: <TrendingDown />,
                label: "$6,000 Total Expense",
                color: "#C0392B",
              },
              {
                icon: <TrendingUp />,
                label: "$2,500 Total Savings",
                color: "#3498DB",
              },
              {
                icon: <CurrencyExchange />,
                label: "USD | GMT -5",
                color: "#E67E22",
              },
            ].map((item, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: 2,
                  borderRadius: 3,
                  bgcolor: item.color,
                  color: "white",
                  width: "100%",
                  maxWidth: 280, // Ensures uniform width
                  height: 80, // Matches other cards' height
                }}
              >
                {item.icon}
                <Typography variant="h6" fontWeight="bold">
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* Expenses Chart */}
        <Grid item xs={12} md={8}>
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
                      const { income, expense } = payload[0].payload;
                      const formattedIncome = new Intl.NumberFormat().format(
                        income
                      );
                      const formattedExpense = new Intl.NumberFormat().format(
                        expense
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
                            <span style={{ color: "#16A085" }}>
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
                            <span style={{ color: "#C0392B" }}>
                              ${formattedExpense}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  {/* <ReferenceLine y={1000} stroke="red" strokeDasharray="3 3" label="Avg Expense" /> */}
                  <Bar
                    dataKey="income"
                    fill="#16A085"
                    radius={[30, 30, 0, 0]}
                    name="Income"
                  >
                    <LabelList
                      dataKey="income"
                      position="top"
                      fill="#16A085"
                      fontSize={12}
                    />
                  </Bar>

                  <Bar
                    dataKey="expense"
                    fill="#C0392B"
                    radius={[30, 30, 0, 0]}
                    name="Expense"
                  >
                    <LabelList
                      dataKey="expense"
                      position="top"
                      fill="#C0392B"
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
                    color: categoryData[tx.category as Category].color, // Type assertion for category
                    borderLeft: `5px solid ${
                      categoryData[tx.category as Category].color
                    }`, // Set left border color
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Category Icon */}
                    <Box
                      sx={{
                        color: categoryData[tx.category as Category].color,
                      }}
                    >
                      {categoryData[tx.category as Category].icon}
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
              sx={{ position: "absolute", bottom: 15, right: 20, zIndex: 0}}
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
                  {/* Purpose Field */}
                  <TextField
                    label="Purpose"
                    fullWidth
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    variant="outlined"
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
                    >
                      <MenuItem value="food">Food</MenuItem>
                      <MenuItem value="transport">Transport</MenuItem>
                      <MenuItem value="entertainment">Entertainment</MenuItem>
                      <MenuItem value="utilities">Utilities</MenuItem>
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
                    setPurpose("");
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
                    setPurpose("");
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
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              p: 2,
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

export default AdminDashboard;


