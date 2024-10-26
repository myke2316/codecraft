import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

// Define a color palette
const COLORS = ['#056275', '#4b3987'];

function PieChartCompletion({ data }) {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          className="custom-tooltip"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: '4px',
          }}
        >
          <Typography variant="body2" color="textPrimary">
            {`${payload[0].name}: ${payload[0].value} Users`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          wrapperStyle={{
            paddingLeft: '20px',
            fontSize: '14px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartCompletion;