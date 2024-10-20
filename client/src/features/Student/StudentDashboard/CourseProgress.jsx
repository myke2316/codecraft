import React from "react";
import { useSelector } from "react-redux";
import { Typography, Grid, Box, LinearProgress } from "@mui/material";

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
    lessonProgress.documentsProgress.some(
      (dp) => dp.documentId === doc._id && !dp.locked
    )
  ).length;

  const totalQuizzes = lesson.quiz.length;
  const completedQuizzes = lesson.quiz.filter((quiz) =>
    lessonProgress.quizzesProgress.some(
      (qp) => qp.quizId.includes(quiz._id) && !qp.locked
    )
  ).length;

  const totalActivities = lesson.activities.length;
  const completedActivities = lesson.activities.filter((activity) =>
    lessonProgress.activitiesProgress.some(
      (ap) => ap.activityId === activity._id && !ap.locked
    )
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

  const averageLessonProgress =
    progressPerLesson.reduce((sum, progress) => sum + progress, 0) / totalLessons;

  return totalLessons === 0 ? 0 : averageLessonProgress;
};

const CourseProgress = () => {
  const userProgress = useSelector((state) => state.studentProgress.userProgress);
  const courses = useSelector((state) => state.course.courseData);

  return (
    <Box sx={{ padding: 3 }}>
     

      <Grid container spacing={4} justifyContent="center">
        {userProgress.coursesProgress &&
          userProgress.coursesProgress.map((courseProgress, index) => {
            const courseTitle = getCourseTitle(courseProgress.courseId, courses);
            const course = courses.find((c) => c._id === courseProgress.courseId);

            if (!course) {
              return null; // Skip if course not found
            }

            const progressPercentage = calculateCourseProgress(
              course.lessons,
              courseProgress.lessonsProgress
            );

            return (
              <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "background.paper",
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    {courseTitle}
                  </Typography>

                  <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="textSecondary">
                      Progress: {Math.round(progressPercentage)}%
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mt: 2,
                        backgroundColor: "grey.300",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          backgroundColor:
                            progressPercentage > 50
                              ? "primary.main"
                              : "secondary.main",
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

export default CourseProgress;
