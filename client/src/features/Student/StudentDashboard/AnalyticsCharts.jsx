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
  LabelList
} from "recharts";
import { Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";

// Function to format time in hours:minutes:seconds
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs}h ${mins}m ${secs}s`;
};

// Main component for displaying analytics charts
const AnalyticsCharts = () => {
  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );
  const courses = useSelector((state) => state.course.courseData);

  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("points"); // Default chart type

  useEffect(() => {
  
    if (userAnalytics.coursesAnalytics && courses.length) {
      const data = userAnalytics.coursesAnalytics.map((courseAnalytics) => {
        
        const course = courses.find((c) => {
          if (typeof courseAnalytics.courseId === 'object' && courseAnalytics.courseId._id) {
            return c._id === courseAnalytics.courseId._id;
          } else {
            return c._id === courseAnalytics.courseId;
          }
        });
        // console.log('courseAnalytics.courseId:', courseAnalytics.courseId);
        // console.log('course:'+ course);
        return {
          courseTitle: course ? course.title : "Unknown Course",
          totalPointsEarned: courseAnalytics.totalPointsEarned,
          totalTimeSpent: courseAnalytics.totalTimeSpent // Keep in seconds
        };
      });
      setData(data);
    }
  }, [userAnalytics, courses]);

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Course Summary
      </Typography>
      <FormControl component="fieldset">
        <FormLabel component="legend">Select Data to Display</FormLabel>
        <RadioGroup
          row
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <FormControlLabel value="points" control={<Radio />} label="Points Earned" />
          <FormControlLabel value="time" control={<Radio />} label="Time Spent" />
        </RadioGroup>
      </FormControl>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="courseTitle" />
          <YAxis />
          <Tooltip
            formatter={(value, name) =>
              name === "Time Spent" ? formatTime(value) : value
            }
          />
          {chartType === "points" && (
            <Bar dataKey="totalPointsEarned" fill="#8884d8" name="Points Earned">
              <LabelList dataKey="totalPointsEarned" position="top" />
            </Bar>
          )}
          {chartType === "time" && (
            <Bar
              dataKey="totalTimeSpent"
              fill="#82ca9d"
              name="Time Spent"
             
            >
              <LabelList
                dataKey="totalTimeSpent"
                position="top"
                formatter={(value) => formatTime(value)}
              />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsCharts;
