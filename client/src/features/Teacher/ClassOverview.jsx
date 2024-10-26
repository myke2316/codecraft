import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { School, Timer, EmojiEvents } from '@mui/icons-material';
import { formatTime } from "../../utils/formatTime";
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

function ClassOverview({ averagePoints, averageTimeSpent, students, handleOnClick, handleOpenDialog }) {
  const [mode, setMode] = useState('light');
  const user = useSelector(state => state.user.userDetails);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        sx={{
          borderRadius: '20px',
          border: `4px solid ${mode === 'dark' ? '#ffffff' : '#6e61ab'}`,
          background: mode === 'dark' ? '#2d2d2d' : 'white',
          color: mode === 'dark' ? '#ffffff' : '#333',
          padding: { xs: '20px', sm: '30px' },
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: { xs: '20px', sm: '30px' },
            textAlign: 'left',
            color: mode === 'dark' ? '#ffffff' : '#333',
            letterSpacing: '1px',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Class Overview
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  backgroundColor: mode === 'dark' ? '#424242' : '#ffff',
                  borderRadius: '15px',
                  padding: { xs: '15px', sm: '20px' },
                  textAlign: 'center',
                  boxShadow: '0 10px 30px #0005',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: '5px', sm: '10px' } }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: { xs: '30px', sm: '40px' }, color: '#3f51b5' } })}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: { xs: '5px', sm: '10px' }, 
                    color: mode === 'dark' ? '#ffffff' : '#333',
                    fontSize: { xs: '0.9rem', sm: '1.25rem' },
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#3f51b5',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {user.role === 'student' && (
          <Box 
            sx={{ 
              display: 'flex', 
              mt: { xs: '20px', sm: '40px' },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'flex-start' },
              gap: { xs: '10px', sm: '16px' },
            }}
          >
            <motion.button
              onClick={handleOnClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(to right, #3f51b5, #1e88e5)',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease-in-out',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Start Course Now!
            </motion.button>
            <motion.button
              onClick={handleOpenDialog}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(to right, #f44336, #e91e63)',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease-in-out',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Leave Class
            </motion.button>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}

export default ClassOverview;