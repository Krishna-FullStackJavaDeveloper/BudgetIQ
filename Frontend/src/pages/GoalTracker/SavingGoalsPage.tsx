import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavingGoalResponse } from "../../components/Interface/goalTracker";
import { GoalService } from "../../service/goalService";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { LinearProgress } from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";

const SavingGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<SavingGoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGoals, setFilteredGoals] = useState<SavingGoalResponse[]>([]);
  const hasFetched = useRef(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState<{ id: number } | null>(null);

  const loadGoals = async () => {
    try {
      if (!hasFetched.current) {
        hasFetched.current = true;
        const response = await GoalService.getAllGoals();
        setGoals(response.data);
        setFilteredGoals(response.data); // Initialize filtered goals
      }
    } catch (err) {
      setError("Failed to load saving goals.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (item: { id: number }) => {
    setItemToDelete(item);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await GoalService.deleteGoal(itemToDelete.id);
      const updatedGoals = goals.filter((goal) => goal.id !== itemToDelete.id);
      setGoals(updatedGoals);
      setFilteredGoals(
        updatedGoals.filter((goal) =>
          goal.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } catch (err) {
      console.error("Failed to delete goal:", err);
      alert("Failed to delete goal. Please try again.");
    } finally {
      setOpenDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Load goals only once on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Filter goals when searchQuery changes
  useEffect(() => {
    const filtered = goals.filter((goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGoals(filtered);
  }, [searchQuery, goals]);

  const handleAddGoal = () => {
    navigate("/goals/create");
  };

  const handleViewDetails = (id: number) => {
    navigate(`/goals/${id}`);
  };

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          My Saving Goals
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search goal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                height: "45px", // Optional for consistency
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                textAlign: "center",
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon fontSize="small" />}
            onClick={handleAddGoal}
            sx={{
              // borderRadius: 3,
              textTransform: "none",
              // boxShadow: "0 4px 10px rgb(25 118 210 / 0.3)",
              "&:hover": {
                boxShadow: "0 6px 14px rgb(25 118 210 / 0.5)",
              },
              px: 3,
              fontWeight: 600,
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              // gap: 1,

              // Fix icon vertical alignment here:
              "& .MuiButton-startIcon": {
                display: "flex",
                alignItems: "center",
                verticalAlign: "middle",
                marginTop: 0,
              },
              "& .MuiSvgIcon-root": {
                verticalAlign: "middle",
              },
            }}
          >
            Add Goal
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {!loading && goals.length === 0 && (
        <Typography color="text.secondary" mt={2}>
          You have no saving goals yet. Start by adding one!
        </Typography>
      )}

      {!loading && filteredGoals.length === 0 && searchQuery !== "" && (
        <Typography color="text.secondary" mt={2}>
          No matching goals found.
        </Typography>
      )}

      <Grid container spacing={3} mt={1}>
        {!loading &&
          filteredGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {goal.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🎯 Target: <strong>${goal.targetAmount}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💰 Saved: <strong>${goal.totalSaved?.toFixed(2)}</strong>
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress
                      determinate
                      value={goal.progressPercent}
                      // sx={{ height: 10, borderRadius: 5 }}
                      style={{
                        height: 8,
                        borderRadius: 3,
                        backgroundColor: "#ddd",
                      }}
                      color={
                        goal.progressPercent === 0
                          ? "neutral" // Color is neutral if the strength is 0
                          : goal.progressPercent < 50
                          ? "success" // Color is danger if below 50
                          : goal.progressPercent < 75
                          ? "success" // Color is warning if between 50 and 75
                          : "success" // Color is success if above 75
                      }
                      size="md"
                      variant="soft"
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={0.5}
                    >
                      {goal.progressPercent?.toFixed(1)}% achieved
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />
                <Box p={1.5} textAlign="right">
                  <Tooltip title="View Details">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(goal.id)}
                      aria-label="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Goal">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteGoal({ id: goal.id })}
                      aria-label="Delete Goal"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        <Dialog
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
        >
          <DialogTitle>Delete Goal</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>
                {itemToDelete?.id &&
                  filteredGoals.find((g) => g.id === itemToDelete.id)?.title}
              </strong>{" "}
              goal?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={confirmDelete} color="error">
              OK
            </Button>
            <Button
              onClick={() => {
                setOpenDeleteModal(false);
                setItemToDelete(null);
              }}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
};

export default SavingGoalsPage;
