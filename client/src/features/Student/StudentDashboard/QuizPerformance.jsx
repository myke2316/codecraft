import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
} from "@mui/material";

const QuizPerformance = () => {
  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );
  const courses = useSelector((state) => state.course.courseData);

  const [courseTotals, setCourseTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      // Aggregate quiz scores by course
      const totalScores = userAnalytics.coursesAnalytics.reduce((acc, courseAnalytics) => {
        const courseId = typeof courseAnalytics.courseId === 'object' && courseAnalytics.courseId._id
          ? courseAnalytics.courseId._id
          : courseAnalytics.courseId;
      
        courseAnalytics.lessonsAnalytics.forEach((lesson) => {
          lesson.quizzesAnalytics.forEach((quizAnalytics) => {
            acc[courseId] = (acc[courseId] || 0) + quizAnalytics.pointsEarned;
          });
        });
        return acc;
      }, {});
      
      // Convert totals to array format for chart
      const totalData = Object.keys(totalScores).map((courseId) => ({
        courseId,
        totalPoints: totalScores[courseId],
        courseTitle: courses.find((course) => course._id === courseId)?.title || "Unknown Course"
      }));
      setCourseTotals(totalData);
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [userAnalytics, courses]);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>
        Quiz Performance
      </Typography>

      {/* Loading and Error Handling */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && courseTotals.length === 0 && (
        <Typography variant="body1" color="textSecondary">
          No quiz performance data available.
        </Typography>
      )}

      {/* Quiz Performance Bar Chart */}
      {!loading && !error && courseTotals.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={courseTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="courseTitle" label={{  position: 'insideBottomRight', offset: 0 }} />
            <YAxis label={{ value: 'Total Points', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="totalPoints" fill="#8884d8" name="Total Points Earned">
              <LabelList dataKey="totalPoints" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default QuizPerformance;
