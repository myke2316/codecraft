import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatDate } from "../../../utils/formatDate";
import { Box, Typography, useTheme, useMediaQuery, Paper, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import RefreshIcon from '@mui/icons-material/Refresh';

const TeacherCompletionTimelineChart = ({ userProgress }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const groupedData = useMemo(() => {
    const completionData = [];

    userProgress.coursesProgress.forEach((course) => {
      course.lessonsProgress.forEach((lesson) => {
        lesson.documentsProgress.forEach((doc) => {
          if (!doc.locked && doc.dateFinished) {
            const date = new Date(doc.dateFinished);
            if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
              completionData.push({
                date: formatDate(doc.dateFinished),
                type: "Document",
              });
            }
          }
        });

        lesson.quizzesProgress.forEach((quiz) => {
          if (!quiz.locked && quiz.dateFinished) {
            const date = new Date(quiz.dateFinished);
            if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
              completionData.push({
                date: formatDate(quiz.dateFinished),
                type: "Quiz",
              });
            }
          }
        });

        lesson.activitiesProgress.forEach((activity) => {
          if (!activity.locked && activity.dateFinished) {
            const date = new Date(activity.dateFinished);
            if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
              completionData.push({
                date: formatDate(activity.dateFinished),
                type: "Activity",
              });
            }
          }
        });
      });
    });

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

    return grouped.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [userProgress, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>{label}</Typography>
          {payload.map((entry) => (
            <Typography key={entry.name} variant="body2" sx={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Completion Trends Over Time</Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              minDate={startDate}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              fullWidth
              startIcon={<RefreshIcon />}
            >
              Reset Date Range
            </Button>
          </Grid>
        </Grid>
      </LocalizationProvider>
  
      <Box sx={{ width: '100%', height: { xs: 300, sm: 400, md: 500 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={groupedData}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: theme.palette.text.secondary }}
              tickMargin={10}
              angle={isMobile ? -45 : isTablet ? -30 : 0}
              textAnchor={isMobile || isTablet ? "end" : "middle"}
              height={80}
              interval={isMobile ? 2 : 1}
            />
            <YAxis 
              tick={{ fill: theme.palette.text.secondary }}
              tickMargin={10}
              width={40}
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
              dot={isMobile ? false : { r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Quiz" 
              stroke={theme.palette.secondary.main} 
              strokeWidth={2}
              dot={isMobile ? false : { r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Activity" 
              stroke={theme.palette.error.main} 
              strokeWidth={2}
              dot={isMobile ? false : { r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Total" 
              stroke={theme.palette.success.main} 
              strokeWidth={3}
              dot={isMobile ? false : { r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TeacherCompletionTimelineChart;