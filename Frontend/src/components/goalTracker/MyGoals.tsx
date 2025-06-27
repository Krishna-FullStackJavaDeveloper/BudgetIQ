import React, { useEffect, useState } from "react";
import { GoalService } from "../../service/goalService";
import { SavingGoalResponse } from "../Interface/goalTracker";

const MyGoals = () => {
  const [goals, setGoals] = useState<SavingGoalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    try {
      const res = await GoalService.getAllGoals();
      setGoals(res.data); // assuming `ApiResponse<T>` structure
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Saving Goals</h2>
      {goals.length === 0 ? (
        <p>No goals set</p>
      ) : (
        <ul>
          {goals.map((goal: any) => (
            <li key={goal.id}>
              {goal.title} - Progress: {goal.progressPercent?.toFixed(2)}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyGoals;
