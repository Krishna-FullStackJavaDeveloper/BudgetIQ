import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoalService } from "../../service/goalService";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";

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
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        priority: parseInt(form.priority),
      };

      await GoalService.createGoal(payload);
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

          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

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
