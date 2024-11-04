import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';

// Define a color palette
const COLORS = ['#056275', '#4b3987'];

const TeacherCourseCompletionChart = ({ classesData, userProgress, users }) => {
  const classes = useSelector(state => state.class.class);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    
  const courseCompletionData = useMemo(() => {
    if (!classesData || classesData.length === 0 || !userProgress || !users) {
      return [
        { name: "Completed", value: 0 },
        { name: "Not Completed", value: 0 },
      ];
    }

    let completed = 0;
    let notCompleted = 0;

    classesData.forEach(classItem => {
      classItem.students.forEach(studentId => {
        const userProgressEntry = users.find(up => up._id.toString() === studentId.toString());
        if (userProgressEntry) {
          const isCompleted = userProgressEntry.courseCompleted === true;
          if (isCompleted) {
            completed++;
          } else {
            notCompleted++;
          }
        } else {
          notCompleted++;
        }
      });
    });

    return [
      { name: "Completed", value: completed },
      { name: "Not Completed", value: notCompleted },
    ];
  }, [classesData, userProgress, users]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: theme.spacing(1) }}>
          <Typography variant="body2">
            {`${payload[0].name}: ${payload[0].value} Students`}
          </Typography>
        </Card>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Course Completion
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Overview of student course completion status
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          {isSmallScreen ? (
            <BarChart data={courseCompletionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={courseCompletionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {courseCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCompletionChart;
