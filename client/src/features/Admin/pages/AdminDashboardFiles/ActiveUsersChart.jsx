import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Paper } from '@mui/material';

function ActiveUsersChart({ data }) {
  const theme = useTheme();

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
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Typography variant="h6" gutterBottom align="center">
   <br/ >
      </Typography>
      <Box sx={{ width: '100%', height: 'calc(100% - 40px)' }}> {/* Adjust height to account for title */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
  );
}

export default ActiveUsersChart;