import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Paper, TextField, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfDay, endOfDay, parseISO, isWithinInterval, isBefore, isAfter, addDays } from 'date-fns';
import { useFetchActiveUserLogsQuery } from './activeUserLogService';

function ActiveUsersChart() {
  const theme = useTheme();
  const [startDate, setStartDate] = useState(startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [error, setError] = useState('');
    const {
    data,
    isLoading: dataLoading,
    refetch,
  }  = useFetchActiveUserLogsQuery()
  console.log(data)
  const handleStartDateChange = (newValue) => {
    if (!newValue) {
      setError('Start date cannot be empty');
      return;
    }
    
    const newStartDate = startOfDay(newValue);
    if (isAfter(newStartDate, endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    // Don't allow dates more than 90 days in the past
    const minDate = startOfDay(addDays(new Date(), -90));
    if (isBefore(newStartDate, minDate)) {
      setError('Start date cannot be more than 90 days in the past');
      return;
    }

    setError('');
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (newValue) => {
    if (!newValue) {
      setError('End date cannot be empty');
      return;
    }
    
    const newEndDate = endOfDay(newValue);
    if (isBefore(newEndDate, startDate)) {
      setError('End date cannot be before start date');
      return;
    }
 

    setError('');
    setEndDate(newEndDate);
  };

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    try {
      return data.filter(item => {
        if (!item.date) return false;
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: startDate, end: endDate });
      });
    } catch (err) {
      console.error('Error filtering data:', err);
      return [];
    }
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
        justifyContent: 'center', 
        paddingTop:"50px"
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate}
              minDate={addDays(new Date(), -90)}
              slotProps={{
                textField: {
                  helperText: 'Select start date',
                  error: !!error && error.includes('Start date')
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              maxDate={new Date()}
              minDate={startDate}
              slotProps={{
                textField: {
                  helperText: 'Select end date',
                  error: !!error && error.includes('End date')
                }
              }}
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
                dataKey="activeUserCount"
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