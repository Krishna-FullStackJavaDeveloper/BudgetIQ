import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoalService } from "../../service/goalService";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Paper,
  Alert,
  Stack,
} from "@mui/material";

const EditGoalForm: React.FC = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await GoalService.getGoalById(Number(goalId));
        setForm({
          ...res.data,
          startDate: res.data.startDate.slice(0, 10),
          endDate: res.data.endDate.slice(0, 10),
        });
      } catch (err) {
        setError("Failed to load goal.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [goalId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        priority: parseInt(form.priority),
      };
      await GoalService.updateGoal(Number(goalId), payload);
      navigate(`/goals/${goalId}`);
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("Update failed.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!form) return <p>Goal not found.</p>;

   return (
    <Box maxWidth="sm" mx="auto" p={2}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Edit Saving Goal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Title"
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
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Priority"
            name="priority"
            select
            value={form.priority}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="1">High</MenuItem>
            <MenuItem value="2">Medium</MenuItem>
            <MenuItem value="3">Low</MenuItem>
          </TextField>

          <TextField
            label="Source Category"
            name="sourceCategory"
            value={form.sourceCategory}
            onChange={handleChange}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Save Changes
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default EditGoalForm;
