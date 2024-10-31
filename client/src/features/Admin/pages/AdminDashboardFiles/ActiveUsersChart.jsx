import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

function ActiveUsersChart({ data }) {
  const theme = useTheme();
  const [startDate, setStartDate] = useState(startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))); // 7 days ago
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  }, [data, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="body2">{`Date: ${label}`}</Typography>
          <Typography variant="body2" color="primary">
            {`Active Users: ${payload[0].value}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
     
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(startOfDay(newValue))}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(endOfDay(newValue))}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
        <Box sx={{ width: '100%', height: 'calc(100% - 100px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{ value: 'Active Users', angle: -90, position: 'insideLeft', offset: -5 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, bottom: 0 }} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default ActiveUsersChart;