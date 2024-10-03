import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";
import { formatDate } from "../../../utils/formatDate";
import { Box, Typography, useTheme } from "@mui/material";

const CompletionTimelineChart = () => {
  const theme = useTheme();
  const userProgress = useSelector((state) => state.studentProgress.userProgress);

  const groupedData = useMemo(() => {
    const completionData = [];

    userProgress.coursesProgress.forEach((course) => {
      course.lessonsProgress.forEach((lesson) => {
        lesson.documentsProgress.forEach((doc) => {
          if (!doc.locked && doc.dateFinished) {
            completionData.push({
              date: formatDate(doc.dateFinished),
              type: "Document",
            });
          }
        });

        lesson.quizzesProgress.forEach((quiz) => {
          if (!quiz.locked && quiz.dateFinished) {
            completionData.push({
              date: formatDate(quiz.dateFinished),
              type: "Quiz",
            });
          }
        });

        lesson.activitiesProgress.forEach((activity) => {
          if (!activity.locked && activity.dateFinished) {
            completionData.push({
              date: formatDate(activity.dateFinished),
              type: "Activity",
            });
          }
        });
      });
    });

    // Group data by date
    const grouped = completionData.reduce((acc, item) => {
      const existingEntry = acc.find((entry) => entry.date === item.date);
      if (existingEntry) {
        existingEntry[item.type]++;
        existingEntry.Total++;
      } else {
        acc.push({ 
          date: item.date, 
          Document: 0, 
          Quiz: 0, 
          Activity: 0, 
          [item.type]: 1,
          Total: 1
        });
      }
      return acc;
    }, []);

    // Sort data by date
    return grouped.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [userProgress]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          backgroundColor: 'background.paper', 
          p: 2, 
          border: 1, 
          borderColor: 'divider', 
          borderRadius: 1 
        }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry) => (
            <Typography key={entry.name} variant="body2" sx={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 500, p: 2 }}>
  
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={groupedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: theme.palette.text.secondary }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fill: theme.palette.text.secondary }}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          <Line 
            type="monotone" 
            dataKey="Document" 
            stroke={theme.palette.primary.main} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="Quiz" 
            stroke={theme.palette.secondary.main} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="Activity" 
            stroke={theme.palette.error.main} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="Total" 
            stroke={theme.palette.success.main} 
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CompletionTimelineChart;