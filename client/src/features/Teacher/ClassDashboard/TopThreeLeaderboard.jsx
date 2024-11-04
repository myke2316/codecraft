import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Typography, Box, Avatar, useTheme, useMediaQuery } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';

const TopThreeLeaderboard = ({ students, totalAnalytics, selectedClass }) => {
  const [mode, setMode] = useState('light');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const topThreeStudents = useMemo(() => {
    const studentsWithPoints = students.map(student => {
      const analytics = totalAnalytics.find(a => a.userId === student._id);
      return {
        ...student,
        totalPoints: analytics ? analytics.totalPointsEarned : 0
      };
    });

    return studentsWithPoints
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);
  }, [students, totalAnalytics]);

  const getColor = (index) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return '#FFFFFF';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          backgroundColor: mode === 'dark' ? '#2d2d2d' : '#f5f5f5', 
          borderRadius: '20px',
          border: `4px solid ${mode === 'dark' ? '#ffffff' : '#6e61ab'}`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 'bold', 
            color: mode === 'dark' ? '#ffffff' : '#333',
            mb: { xs: '20px', sm: '30px' },
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Top 3 Students {selectedClass === 'all' ? 'Overall' : 'in Class'}
        </Typography>
        {topThreeStudents.map((student, index) => (
          <motion.div
            key={student._id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                backgroundColor: mode === 'dark' ? '#424242' : '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: getColor(index),
                  color: '#000',
                  width: 48,
                  height: 48,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {index === 0 ? <EmojiEventsIcon /> : index + 1}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: mode === 'dark' ? '#ffffff' : '#333',
                  }}
                >
                  {student.username}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: mode === 'dark' ? '#cccccc' : 'text.secondary',
                  }}
                >
                  {student.totalPoints} points
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Paper>
    </motion.div>
  );
};

export default TopThreeLeaderboard;