import React, { useState, useEffect } from "react";
import {
  Typography,
  LinearProgress,
  Box,
  Avatar,
  Paper,
  Tooltip,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { useSelector } from "react-redux";
import { Person, EmojiEvents, TrendingUp } from "@mui/icons-material";
import { SiJavascript, SiHtml5, SiCss3, SiPhp } from "react-icons/si";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const getCourseTitle = (courseId, courses) => {
  const course = courses.find((c) => c._id === courseId);
  return course ? course.title : "Unknown Course";
};

const calculateCourseProgress = (lessons, lessonsProgress) => {
  if (!lessons || !lessonsProgress) return 0;

  const totalLessons = lessons.length;
  const progressPerLesson = lessons.map((lesson) => {
    const lessonProgress = lessonsProgress.find(
      (lp) => lp.lessonId === lesson._id
    );
    return calculateLessonProgress(lesson, lessonProgress);
  });

  const averageLessonProgress =
    progressPerLesson.reduce((sum, progress) => sum + progress, 0) /
    totalLessons;

  return totalLessons === 0 ? 0 : averageLessonProgress;
};

const calculateLessonProgress = (lesson, lessonProgress) => {
  if (!lesson || !lessonProgress) return 0;

  const totalItems = lesson.documents.length + lesson.quiz.length + lesson.activities.length;
  const completedItems = 
    lesson.documents.filter(doc => lessonProgress.documentsProgress.some(dp => dp.documentId === doc._id && !dp.locked)).length +
    lesson.quiz.filter(quiz => lessonProgress.quizzesProgress.some(qp => qp.quizId.includes(quiz._id) && !qp.locked)).length +
    lesson.activities.filter(activity => lessonProgress.activitiesProgress.some(ap => ap.activityId === activity._id && !ap.locked)).length;

  return totalItems === 0 ? 0 : (completedItems / totalItems) * 100;
};

const TeacherPlayerDashboard = ({
  totalPoints,
  userProgress,
  userInfo,
  badges,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const username = userInfo?.username || "Student";
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [progress, setProgress] = useState(0);

  const courses = useSelector((state) => state.course.courseData);

  const calculateLevel = (points) => {
    let level = 1;
    let pointsRequired = 2;
    while (points >= pointsRequired) {
      points -= pointsRequired;
      level += 1;
      pointsRequired = Math.floor(pointsRequired * 1.5);
    }
    return {
      level,
      pointsToNextLevel: pointsRequired - points,
      pointsRequired,
    };
  };

  const { level, pointsToNextLevel, pointsRequired } =
    calculateLevel(totalPoints);
  const animationDuration = totalPoints * 30;

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < totalPoints) {
        progress += Math.min(50, totalPoints - progress);
        setAnimatedPoints(progress);
      } else {
        clearInterval(interval);
      }
    }, animationDuration / totalPoints);
    return () => clearInterval(interval);
  }, [totalPoints, animationDuration]);

  useEffect(() => {
    const targetProgress =
      ((pointsRequired - pointsToNextLevel) / pointsRequired) * 100;
    setProgress(targetProgress);
  }, [pointsToNextLevel, pointsRequired]);

  useEffect(() => {
    setPreviousLevel(level);
  }, [level]);

  const achievementBadges = [
    { id: 1, name: "First Step", icon: "🏆" },
    { id: 2, name: "Course Completed", icon: "🎓" },
    { id: 3, name: "Consistent", icon: "👷🏼‍♂️" },
    { id: 4, name: "HTML Finisher", icon: "📑" },
    { id: 5, name: "HTML Master", icon: "📄" },
    { id: 6, name: "Beginner Stylist", icon: "👨🏼‍🎨" },
    { id: 7, name: "CSS Flex", icon: "💪🏼" },
    { id: 8, name: "CSS Grid", icon: "🍱" },
    { id: 9, name: "CSS Designer", icon: "🎨" },
    { id: 10, name: "JS Introduction", icon: "💻" },
    { id: 11, name: "Getting There", icon: "📊" },
    { id: 12, name: "JS Consistent", icon: "🤲🏼" },
    { id: 13, name: "JS Manipulator", icon: "👨🏼‍💻" },
    { id: 14, name: "JS Master", icon: "👾" },
    { id: 15, name: "First Lesson!", icon: "1️⃣" },
  ];

  const uniqueBadgesWithIcons = badges.reduce((acc, badge) => {
    if (!acc.some((b) => b.name === badge.name)) {
      const matchingBadge = achievementBadges.find(
        (ach) => ach.name === badge.name
      );
      const badgeWithIcon = {
        ...badge,
        icon: matchingBadge ? matchingBadge.icon : "🏅",
      };
      acc.push(badgeWithIcon);
    }
    return acc;
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: uniqueBadgesWithIcons.length > 1,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : Math.min(4, uniqueBadgesWithIcons.length),
    slidesToScroll: 1,
    arrows: uniqueBadgesWithIcons.length > 1,
  };

  return (
    <Paper
      elevation={3}
      className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-indigo-700 p-2"
    >
      <Box
        className="p-4 md:p-6 text-white"
        sx={{ animation: `${fadeIn} 1s ease-in-out` }}
      >
        <Box className="flex flex-col md:flex-row items-center mb-6">
          <Avatar
            src={userInfo?.picture}
            sx={{ width: 60, height: 60, md: { width: 80, height: 80 } }}
            className="border-4 border-white shadow-lg mb-4 md:mb-0"
          >
            {!userInfo?.picture && <Person fontSize="large" />}
          </Avatar>
          <Box className="md:ml-4 flex-grow text-center md:text-left">
            <Typography
              variant="h4"
              className="font-bold text-2xl md:text-4xl"
              sx={{
                animation:
                  previousLevel !== level
                    ? `${scaleUp} 0.6s ease-in-out`
                    : "none",
              }}
            >
              {username}
            </Typography>
            <Typography variant="h6" className="text-blue-200 text-lg md:text-xl">
              Level {level}
            </Typography>
          </Box>
          <Tooltip title="Total Points" arrow placement="top">
            <Box className="text-center mt-4 md:mt-0">
              <EmojiEvents fontSize="large" className="text-yellow-300 mb-1" />
              <Typography variant="h5" className="font-bold">
                {animatedPoints}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Box className="mb-4">
          <Box className="flex justify-between mb-1">
            <Typography variant="body2" className="text-blue-200">
              Progress to Next Level
            </Typography>
            <Typography variant="body2" className="text-blue-200">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: "white",
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

        <Box className="mt-4">
          <Grid container spacing={2}>
            {userProgress.coursesProgress &&
              userProgress.coursesProgress
                .slice(0, 4)
                .map((courseProgress, index) => {
                  const courseTitle = getCourseTitle(
                    courseProgress.courseId,
                    courses
                  );
                  const course = courses.find(
                    (c) => c._id === courseProgress.courseId
                  );

                  if (!course) {
                    return null;
                  }

                  const progressPercentage = calculateCourseProgress(
                    course.lessons,
                    courseProgress.lessonsProgress
                  );

                  return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: 2,
                          padding: 2,
                          transition: "transform 0.3s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          {course.title === "HTML" ? (
                            <SiHtml5 className="mr-2 text-white" />
                          ) : course.title === "CSS" ? (
                            <SiCss3 className="mr-2 text-white" />
                          ) : course.title === "JavaScript" ? (
                            <SiJavascript className="mr-2 text-white" />
                          ) : (
                            <SiPhp className="mr-2 text-white" />
                          )}
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            noWrap
                          >
                            {courseTitle}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              backgroundColor: "white",
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: "block", textAlign: "right" }}
                        >
                          {Math.round(progressPercentage)}%
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
          </Grid>
        </Box>

        <Box className="mt-6">
          <Typography variant="h6" className="mb-4 font-semibold text-xl">
            Achievements
          </Typography>
          {uniqueBadgesWithIcons.length > 0 ? (
            <Slider {...sliderSettings}>
              {uniqueBadgesWithIcons.map((badge) => (
                <Box key={badge.id} sx={{ textAlign: "center", px: 1 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      md: { width: 80, height: 80 },
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <Typography variant="h4" component="span">
                      {badge.icon}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block", color: "white" }}
                  >
                    {badge.name}
                  </Typography>
                </Box>
              ))}
            </Slider>
          ) : (
            <Typography variant="body2" className="text-center text-blue-200">
              No achievements yet. Keep learning to earn badges!
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default TeacherPlayerDashboard;