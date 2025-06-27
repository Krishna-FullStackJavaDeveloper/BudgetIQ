import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { GoalService } from "../../service/goalService";

const AddGoalTransactionPage: React.FC = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [manuallyAdded, setManuallyAdded] = useState(true);
  const [autoTransferred, setAutoTransferred] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      goalId: Number(goalId),
      amount: parseFloat(amount),
      date: date ? new Date(date).toISOString() : null,
      sourceNote,
      manuallyAdded,
      autoTransferred,
    };

    try {
      setLoading(true);
      await GoalService.addTransaction(payload);
      navigate(`/goals/${goalId}`);
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add Transaction to Goal
        </Typography>

        <form onSubmit={handleAdd}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Date (optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Source Note"
                fullWidth
                placeholder="e.g., Freelance March"
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={manuallyAdded}
                    onChange={(e) => setManuallyAdded(e.target.checked)}
                  />
                }
                label="Manually Added"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoTransferred}
                    onChange={(e) => setAutoTransferred(e.target.checked)}
                  />
                }
                label="Auto Transferred"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Add Transaction"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddGoalTransactionPage;
