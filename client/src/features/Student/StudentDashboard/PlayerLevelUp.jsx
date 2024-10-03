import React, { useState, useEffect } from 'react'
import { Typography, LinearProgress, Box, Avatar, Paper, Tooltip } from '@mui/material'
import { keyframes } from '@mui/system'
import { useSelector } from 'react-redux'
import { Person, EmojiEvents, TrendingUp } from '@mui/icons-material'
import AchievementBadges from './AchievementBadges'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const scaleUp = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const PlayerLevelUp = ({ totalPoints }) => {
  const userInfo = useSelector((state) => state.user.userDetails)
  const username = userInfo.username
  const [animatedPoints, setAnimatedPoints] = useState(0)
  const [previousLevel, setPreviousLevel] = useState(1)
  const [progress, setProgress] = useState(0)

  const calculateLevel = (points) => {
    let level = 1
    let pointsRequired = 2
    while (points >= pointsRequired) {
      points -= pointsRequired
      level += 1
      pointsRequired = Math.floor(pointsRequired * 1.5)
    }
    return { level, pointsToNextLevel: pointsRequired - points, pointsRequired }
  }

  const { level, pointsToNextLevel, pointsRequired } = calculateLevel(totalPoints)
  const animationDuration = totalPoints * 30

  useEffect(() => {
    let progress = 0
    const interval = setInterval(() => {
      if (progress < totalPoints) {
        progress += Math.min(5, totalPoints - progress)
        setAnimatedPoints(progress)
      } else {
        clearInterval(interval)
      }
    }, animationDuration / totalPoints)
    return () => clearInterval(interval)
  }, [totalPoints, animationDuration])

  useEffect(() => {
    const targetProgress = ((pointsRequired - pointsToNextLevel) / pointsRequired) * 100
    setProgress(targetProgress)
  }, [pointsToNextLevel, pointsRequired])

  useEffect(() => {
    setPreviousLevel(level)
  }, [level])

  return (
    <Paper elevation={3} className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600">
      <Box className="p-6 text-white" sx={{ animation: `${fadeIn} 1s ease-in-out` }}>
        <Box className="flex items-center mb-6">
          <Avatar
            src={userInfo.picture}
            sx={{ width: 80, height: 80 }}
            className="border-4 border-white shadow-lg"
          >
            {!userInfo.picture && <Person fontSize="large" />}
          </Avatar>
          <Box className="ml-4 flex-grow">
            <Typography
              variant="h4"
              className="font-bold"
              sx={{
                animation: previousLevel !== level ? `${scaleUp} 0.6s ease-in-out` : "none",
              }}
            >
              {username}
            </Typography>
            <Typography variant="h6" className="text-blue-200">
              Level {level}
            </Typography>
          </Box>
          <Tooltip title="Total Points" arrow placement="top">
            <Box className="text-center">
              <EmojiEvents fontSize="large" className="text-yellow-300 mb-1" />
              <Typography variant="h5" className="font-bold">
                {animatedPoints}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Box className="mb-4">
          <Box className="flex justify-between mb-1">
            <Typography variant="body2" className="text-blue-200">Progress to Next Level</Typography>
            <Typography variant="body2" className="text-blue-200">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: 'white',
              },
            }}
          />
        </Box>

        <Box className="flex items-center justify-between">
          <Typography variant="body2" className="text-blue-200">
            {pointsToNextLevel} points to next level
          </Typography>
          <Tooltip title="Trending Up" arrow placement="top">
            <TrendingUp className="text-green-300" />
          </Tooltip>
        </Box>

        <Box className="mt-6">
          <Typography variant="h6" className="mb-2 font-semibold">Achievements</Typography>
          <AchievementBadges />
        </Box>
      </Box>
    </Paper>
  )
}

export default PlayerLevelUp