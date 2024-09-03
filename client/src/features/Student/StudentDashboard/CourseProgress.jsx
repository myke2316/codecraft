import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, CardActions, Button } from "@mui/material";
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
console.log(lessonProgress.quizzesProgress)
console.log(lesson.quiz)
  const totalQuizzes = lesson.quiz.length;
 const completedQuizzes = lesson.quiz.filter((quiz) =>
    lessonProgress.quizzesProgress.some((qp) =>
      qp.quizId.includes(quiz._id) && !qp.locked
    )
  ).length;

  const totalActivities = lesson.activities.length;
  const completedActivities = lesson.activities.filter((activity) =>
    lessonProgress.activitiesProgress.some((ap) => ap.activityId === activity._id && !ap.locked)
  ).length;

  const totalItems = totalDocuments + totalQuizzes + totalActivities;
  console.log(totalItems)
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
    <Grid container spacing={4}>
  {userProgress.coursesProgress &&
    userProgress.coursesProgress.map((courseProgress, index) => {
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
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: 3,
              borderRadius: 2,
              padding: 2,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                color="primary"
                fontWeight="bold"
                gutterBottom
              >
                {courseTitle}
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
                mb={3}
              >
                <CircularProgress
                  variant="determinate"
                  value={progressPercentage}
                  size={80}
                  thickness={4.5}
                  sx={{ color: "secondary.main" }}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography
                    variant="h6"
                    color="textPrimary"
                    fontWeight="medium"
                  >
                    {`${Math.round(progressPercentage)}%`}
                  </Typography>
                </Box>
              </Box>
         
            </CardContent>
       
          </Card>
        </Grid>
      );
    })}
</Grid>

  );
};

export default CourseProgress;
