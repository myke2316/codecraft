import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";

// Styled component for each course card
const CourseCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  padding: theme.spacing(2),
  textAlign: "center",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

// Helper function to find course title by ID
const getCourseTitle = (courseId, courses) => {
  const course = courses.find((c) => c._id === courseId);
  return course ? course.title : "Unknown Course";
};

// Helper function to calculate progress for a single lesson
const calculateLessonProgress = (lesson, lessonProgress) => {
  if (!lesson || !lessonProgress) return 0;

  const totalDocuments = lesson.documents.length;
  const completedDocuments = lesson.documents.filter((doc) =>
    lessonProgress.documentsProgress.some((dp) => dp.documentId === doc._id && !dp.locked)
  ).length;

  const totalQuizzes = lesson.quiz.length;
  const completedQuizzes = lesson.quiz.filter((quiz) =>
    lessonProgress.quizzesProgress.some((qp) => qp.quizId === quiz._id && !qp.locked)
  ).length;

  const totalActivities = lesson.activities.length;
  const completedActivities = lesson.activities.filter((activity) =>
    lessonProgress.activitiesProgress.some((ap) => ap.activityId === activity._id && !ap.locked)
  ).length;

  const totalItems = totalDocuments + totalQuizzes + totalActivities;
  const completedItems = completedDocuments + completedQuizzes + completedActivities;

  return totalItems === 0 ? 0 : (completedItems / totalItems) * 100;
};

// Helper function to calculate progress for a course
const calculateCourseProgress = (lessons, lessonsProgress) => {
  if (!lessons || !lessonsProgress) return 0;

  const totalLessons = lessons.length;
  const progressPerLesson = lessons.map((lesson) => {
    const lessonProgress = lessonsProgress.find((lp) => lp.lessonId === lesson._id);
    return calculateLessonProgress(lesson, lessonProgress);
  });

  const averageLessonProgress = progressPerLesson.reduce((sum, progress) => sum + progress, 0) / totalLessons;

  return totalLessons === 0 ? 0 : averageLessonProgress;
};

const CourseProgress = () => {
  const userProgress = useSelector((state) => state.studentProgress.userProgress);
  const courses = useSelector((state) => state.course.courseData);

  return (
    <Grid container spacing={3}>
      {userProgress.coursesProgress && userProgress.coursesProgress.map((courseProgress, index) => {
        const courseTitle = getCourseTitle(courseProgress.courseId, courses);
        const course = courses.find((c) => c._id === courseProgress.courseId);
      
        if (!course) {
          // Skip rendering if the course is not found
          return null;
        }

        const progressPercentage = calculateCourseProgress(
          course.lessons,
          courseProgress.lessonsProgress
        );

        return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CourseCard>
              <CardContent>
                <Box mb={2}>
                  <Typography variant="h6">{courseTitle}</Typography>
                </Box>
                <Box mb={2} display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress
                    variant="determinate"
                    value={progressPercentage}
                    size={60}
                    thickness={4}
                  />
                  <Box
                    position="absolute"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="caption" component="div" color="textSecondary">
                      {`${Math.round(progressPercentage)}%`}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Lessons: {course.lessons.length}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Students: 99 {/* Placeholder for student count */}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CourseCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CourseProgress;
