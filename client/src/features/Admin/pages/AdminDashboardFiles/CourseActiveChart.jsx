import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCourseDataQQuery } from '../../../Class/courseService';
import { Typography, Box, Paper, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CourseActiveChart = ({ activeUsersPerCourse }) => {
  const theme = useTheme();
  const { data: courseData, isLoading, error } = useGetCourseDataQQuery();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (courseData && activeUsersPerCourse) {
      const updatedChartData = activeUsersPerCourse.map(course => {
        const courseInfo = courseData.find(c => c._id === course.courseId);
        return {
          courseTitle: courseInfo ? courseInfo.title : "Unknown Course",
          activeUsersCount: course.activeUsers.length,
        };
      });
      setChartData(updatedChartData);
    }
  }, [courseData, activeUsersPerCourse]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="body2">{`${label}`}</Typography>
          <Typography variant="body2" color="primary">{`Active Users: ${payload[0].value}`}</Typography>
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
      <Typography color="error">Error loading courses data.</Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', height: 400 }}>
    
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="courseTitle" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: "Active Users", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar 
            dataKey="activeUsersCount" 
            fill={theme.palette.primary.main} 
            name="Active Users"
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CourseActiveChart;