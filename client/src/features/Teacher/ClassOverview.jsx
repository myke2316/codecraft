import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { School, Timer, EmojiEvents } from '@mui/icons-material';
import { formatTime } from "../../utils/formatTime";
import { motion } from 'framer-motion';

function ClassOverview({ averagePoints, averageTimeSpent, students, handleOnClick, handleOpenDialog }) {
  const [mode, setMode] = useState('light');

  // Effect to retrieve the theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const stats = [
    {
      title: "Average Points",
      value: averagePoints.toFixed(2),
      icon: <EmojiEvents />,
    },
    {
      title: "Total Students",
      value: students.length,
      icon: <School />,
    },
    {
      title: "Avg Time Spent",
      value: formatTime(averageTimeSpent),
      icon: <Timer />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        className='mb-4'
        sx={{
          borderRadius: '20px',
          border: `4px solid ${mode === 'dark' ? '#ffffff' : '#6e61ab'}`, // Border color for the whole component
          background: mode === 'dark' ? '#2d2d2d' : 'white',
          color: mode === 'dark' ? '#ffffff' : '#333',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 'semi-bold',
            marginBottom: '30px',
            textAlign: 'left',
            color: mode === 'dark' ? '#ffffff' : '#333',
            letterSpacing: '1px',
          }}
        >
          Class Overview
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  backgroundColor:" mode === 'dark' ? '#424242' : '#f5f5f5'",
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: '40px', color: '#3f51b5' } })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px', color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e88e5' }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', marginTop: '40px' }}>
          <motion.button
            onClick={handleOnClick}
            whileHover={{ scale: 1.05 }} // Hover scale effect
            whileTap={{ scale: 0.95 }} // Click scale effect
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(to right, #3f51b5, #1e88e5)',
              color: 'white',
              border: 'none', // No border for buttons
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              marginRight: '16px',
              transition: 'all 0.3s ease-in-out', // Smooth transition for hover effects
            }}
          >
            Start Course Now!
          </motion.button>
          <motion.button
            onClick={handleOpenDialog}
            whileHover={{ scale: 1.05 }} // Hover scale effect
            whileTap={{ scale: 0.95 }} // Click scale effect
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(to right, #f44336, #e91e63)',
              color: 'white',
              border: 'none', // No border for buttons
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease-in-out', // Smooth transition for hover effects
            }}
          >
            Leave Class
          </motion.button>
        </Box>
      </Paper>
    </motion.div>
  );
}

export default ClassOverview;
