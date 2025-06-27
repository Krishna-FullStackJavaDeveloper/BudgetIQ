import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  GoalResponse,
  MonthlyProgress,
} from "../../components/Interface/goalTypes";
import { GoalService } from "../../service/goalService";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CustomTooltip from "../../components/layout/CustomTooltip ";

const GoalDetailsPage: React.FC = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<GoalResponse | null>(null);
  const [progressData, setProgressData] = useState<MonthlyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  const fetchGoalDetails = async () => {
    try {
      if (!hasFetched.current) {
        hasFetched.current = true;
        const goalRes = await GoalService.getGoalById(Number(goalId));
        const progressRes = await GoalService.getMonthlyProgress(
          Number(goalId)
        );

        setGoal(goalRes.data);
        setProgressData(progressRes.data);
      }
    } catch (err) {
      console.error("Error loading goal details", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGoalDetails();
  }, [goalId]);

  if (loading) {
    return (
      <Box mt={8} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!goal) {
    return (
      <Typography align="center" mt={10} color="error">
        Goal not found.
      </Typography>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {goal.title}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>🎯 Target:</strong> ${goal.targetAmount}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>💰 Saved:</strong> ${goal.totalSaved?.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>📈 Progress:</strong> {goal.progressPercent?.toFixed(1)}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>🕒 Status:</strong>{" "}
              {goal.achieved ? "Achieved" : "In Progress"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>🗓️ Start:</strong> {goal.startDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>📅 End:</strong> {goal.endDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>⭐ Priority:</strong>{" "}
              {{
                1: "High",
                2: "Medium",
                3: "Low",
              }[goal.priority] || "Unknown"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Monthly Progress
        </Typography>
        {progressData.length === 0 ? (
          <Typography>No transactions yet.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalSaved" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/goals/${goal.id}/add-transaction`)}
          sx={{
            px: 3,
            fontWeight: 600,
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",

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
          Add Transaction
        </Button>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          component={Link}
          to={`/goals/${goal.id}/edit`}
          sx={{
            "&:hover": {
              boxShadow: "0 6px 6px rgb(25 118 210 / 0.5)",
            },
            px: 3,
            fontWeight: 600,
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",

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
          Edit Goal
        </Button>
      </Stack>
    </Box>
  );
};

export default GoalDetailsPage;
