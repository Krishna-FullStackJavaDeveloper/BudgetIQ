import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useGoalService } from "../../service/goalService";

const CreateGoalForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    startDate: "",
    endDate: "",
    priority: "1",
    sourceCategory: "",
  });
  const { createGoal } = useGoalService();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        startDate: dayjs(form.startDate).toISOString(),
        endDate: dayjs(form.endDate).toISOString(),
        priority: parseInt(form.priority),
      };

      await createGoal(payload);
      setSuccess("Goal created successfully!");
      setTimeout(() => navigate("/savingGoals"), 1000);
    } catch (err) {
      setError("Failed to create goal. Please try again.");
      console.error(err);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" mt={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create New Saving Goal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Goal Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Target Amount"
            name="targetAmount"
            type="number"
            value={form.targetAmount}
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
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End Date"
              value={form.endDate ? dayjs(form.endDate) : null}
              onChange={(newValue) => {
                setForm({
                  ...form,
                  endDate:
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
            select
            label="Priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="1">High</MenuItem>
            <MenuItem value="2">Medium</MenuItem>
            <MenuItem value="3">Low</MenuItem>
          </TextField>

          <TextField
            label="Source Category (optional)"
            name="sourceCategory"
            value={form.sourceCategory}
            onChange={handleChange}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Create Goal
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateGoalForm;
