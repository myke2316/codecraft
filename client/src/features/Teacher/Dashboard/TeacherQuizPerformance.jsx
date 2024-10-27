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

const TeacherQuizPerformance = ({ userAnalytics }) => {
  const courses = useSelector((state) => state.course.courseData);

  const [courseTotals, setCourseTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("quiz"); // New state for selecting type

  useEffect(() => {
    try {
      setLoading(true);
      // Aggregate scores based on selected type
      const totalScores = userAnalytics.coursesAnalytics.reduce((acc, courseAnalytics) => {
        const courseId = courseAnalytics.courseId._id || courseAnalytics.courseId;

        courseAnalytics.lessonsAnalytics.forEach((lesson) => {
          const analytics = selectedType === "quiz" ? lesson.quizzesAnalytics : lesson.activitiesAnalytics;

          analytics.forEach((activityAnalytics) => {
            acc[courseId] = (acc[courseId] || 0) + activityAnalytics.pointsEarned;
          });
        });
        return acc;
      }, {});

      // Convert totals to array format for chart
      const totalData = Object.keys(totalScores).map((courseId) => ({
        courseId,
        totalPoints: totalScores[courseId],
        courseTitle: courses.find((course) => course._id === courseId)?.title || "Unknown Course",
      }));

      setCourseTotals(totalData);
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [userAnalytics, courses, selectedType]); // Update dependency array

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>
       Performance
      </Typography>

      {/* Select for Quiz or Activity */}
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="type-select-label">Select Type</InputLabel>
        <Select
          labelId="type-select-label"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Select Type"
        >
          <MenuItem value="quiz">Quiz</MenuItem>
          <MenuItem value="activity">Activity</MenuItem>
        </Select>
      </FormControl>

      {/* Loading and Error Handling */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && courseTotals.length === 0 && (
        <Typography variant="body1" color="textSecondary">
          No {selectedType === "quiz" ? "quiz" : "activity"} performance data available.
        </Typography>
      )}

      {/* Performance Bar Chart */}
      {!loading && !error && courseTotals.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={courseTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="courseTitle" label={{ position: 'insideBottomRight', offset: 0 }} />
            <YAxis label={{ value: 'Total Points', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="totalPoints" fill="#8884d8" name={`Total Points Earned for ${selectedType}`}>
              <LabelList dataKey="totalPoints" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TeacherQuizPerformance;
