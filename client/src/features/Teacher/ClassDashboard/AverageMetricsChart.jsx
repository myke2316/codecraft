import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';
import { formatTime } from '../../../utils/formatTime'; 
import { useGetCourseDataQQuery } from '../../Class/courseService';
const AverageMetricsChart = ({ userAnalytics, relevantStudents }) => {
    const { data: courseData, isLoading: coursesLoading } = useGetCourseDataQQuery();
  const [selectedMetric, setSelectedMetric] = useState('timeSpent');

  const chartData = useMemo(() => {
    if (!courseData || !userAnalytics) return [];

    const courseMetricsData = {};

    // Initialize courseMetricsData
    courseData.forEach(course => {
      courseMetricsData[course._id] = { totalTime: 0, totalPoints: 0, userCount: 0 };
    });
    console.log(userAnalytics)
    // Calculate total metrics per course
    userAnalytics.forEach(user => {
    
      if (relevantStudents.has(user.userId)) {
        user.coursesAnalytics.forEach(course => {
          if (courseMetricsData[course.courseId]) {
            courseMetricsData[course.courseId].totalTime += course.totalTimeSpent;
            courseMetricsData[course.courseId].totalPoints += course.totalPointsEarned;
            courseMetricsData[course.courseId].userCount += 1;
          }
        });
      }
    });

    // Generate chart data
    return Object.keys(courseMetricsData).map(courseId => {
      const course = courseMetricsData[courseId];
      const courseTitle = courseData.find(c => c._id === courseId)?.title || `Course ${courseId}`;
      
      return {
        course: courseTitle,
        averageTimeSpent: course.userCount ? course.totalTime / course.userCount : 0,
        averagePointsEarned: course.userCount ? course.totalPoints / course.userCount : 0,
      };
    });
  }, [courseData, userAnalytics, relevantStudents]);

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Average {selectedMetric === 'timeSpent' ? 'Time Spent' : 'Points Earned'} per Course
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="metric-select-label">Select Metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={selectedMetric}
          label="Select Metric"
          onChange={handleMetricChange}
        >
          <MenuItem value="timeSpent">Time Spent</MenuItem>
          <MenuItem value="pointsEarned">Points Earned</MenuItem>
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="course" />
          <YAxis />
          <Tooltip 
            formatter={(value, name, props) => {
              if (selectedMetric === 'timeSpent') {
                return [`Average Time: ${formatTime(value)}`];
              } else {
                return [`Average Points: ${value.toFixed(2)}`];
              }
            }}
          />
         
          <Bar 
            dataKey={selectedMetric === 'timeSpent' ? 'averageTimeSpent' : 'averagePointsEarned'} 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default AverageMetricsChart;