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
  const userAnalytics = useSelector((state) => state.userAnalytics.userAnalytics);
  const courses = useSelector((state) => state.course.courseData);

  const [courseTotals, setCourseTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("quizzes"); // State to manage selection

  useEffect(() => {
    try {
      setLoading(true);
      // Aggregate scores based on the selected type (quizzes or activities)
      const totalScores = userAnalytics.coursesAnalytics.reduce((acc, courseAnalytics) => {
        const courseId = typeof courseAnalytics.courseId === 'object' && courseAnalytics.courseId._id
          ? courseAnalytics.courseId._id
          : courseAnalytics.courseId;

        courseAnalytics.lessonsAnalytics.forEach((lesson) => {
          let analyticsData = selectedType === "quizzes" 
            ? lesson.quizzesAnalytics 
            : lesson.activitiesAnalytics; // Use activitiesAnalytics for activities

          analyticsData.forEach((activityAnalytics) => {
            acc[courseId] = (acc[courseId] || 0) + activityAnalytics.pointsEarned;
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
  }, [userAnalytics, courses, selectedType]); // Add selectedType to the dependency array

  const handleSelectChange = (event) => {
    setSelectedType(event.target.value); // Update the selected type based on user selection
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>
        Performance
      </Typography>

      {/* Select for Quiz or Activity */}
      <FormControl variant="outlined" fullWidth margin="normal">
        <InputLabel id="select-type-label">Select Type</InputLabel>
        <Select
          labelId="select-type-label"
          value={selectedType}
          onChange={handleSelectChange}
          label="Select Type"
        >
          <MenuItem value="quizzes">Quizzes</MenuItem>
          <MenuItem value="activities">Activities</MenuItem>
        </Select>
      </FormControl>

      {/* Loading and Error Handling */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && courseTotals.length === 0 && (
        <Typography variant="body1" color="textSecondary">
          No {selectedType} performance data available.
        </Typography>
      )}

      {/* Quiz Performance Bar Chart */}
      {!loading && !error && courseTotals.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={courseTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="courseTitle" label={{ position: 'insideBottomRight', offset: 0 }} />
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
