import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoalService } from "../../service/goalService";

const GoalListPage: React.FC = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoalService.getAllGoals()
      .then((res) => setGoals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Saving Goals</h2>
      <Link to="/goals/create" className="text-blue-600 underline">+ Create Goal</Link>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4 mt-4">
          {goals.map((goal: any) => (
            <Link
              to={`/goals/${goal.id}`}
              key={goal.id}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              <p>Saved: ${goal.totalSaved} / ${goal.targetAmount}</p>
              <p>Progress: {goal.progressPercent.toFixed(1)}%</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalListPage;