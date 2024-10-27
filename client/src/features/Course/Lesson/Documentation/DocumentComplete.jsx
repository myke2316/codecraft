import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { Card, CardContent, Button, Typography, Box, useTheme } from "@mui/material";
import { CheckCircle, ArrowForward, AccessTime } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

function DocumentComplete() {
  const { courseId, lessonId, documentId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const theme = useTheme();

  const location = useLocation();
  const totalTimeSpent = location.state?.formattedTime;

  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

  const currentDocumentIndex = lesson.documents.findIndex(
    (doc) => doc._id === documentId
  );
  const nextDocument = lesson.documents[currentDocumentIndex + 1];

  const quiz = lesson.quiz;
  const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;
  const nextQuiz = lesson.quiz[nextQuizIndex];
    
  const handleNext = () => {
    if (nextDocument) {
      navigate(
        `/course/${courseId}/lesson/${lessonId}/document/${nextDocument._id}`
      );
    } else if (nextQuizIndex < lesson.quiz.length) {
      
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`);
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-screen p-4">
      <MotionBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card
          elevation={0}
          sx={{
            background: '#FFFFFF',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent className="p-8">
            <MotionBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center mb-8"
            >
              <CheckCircle sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }} />
              <MotionTypography
                variant="h4"
                className="font-bold mb-2"
                sx={{ color: theme.palette.text.primary }}
              >
                Document Completed!
              </MotionTypography>
              <MotionTypography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Great job on finishing this document.
              </MotionTypography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-indigo-50 rounded-xl p-4 mb-8"
            >
              <Typography variant="body2" className="flex items-center justify-center" sx={{ color: theme.palette.text.secondary }}>
                <AccessTime sx={{ fontSize: 20, mr: 1, color: theme.palette.primary.main }} />
                Time spent: <span className="font-semibold ml-1">{totalTimeSpent}</span>
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                sx={{
                  borderRadius: '12px',
                  padding: '12px 24px',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                {nextDocument ? "Next Document" : nextQuizIndex < lesson.quiz.length ? "Take Quiz" : "Back to Course"}
              </Button>
            </MotionBox>
          </CardContent>
        </Card>
      </MotionBox>
    </Box>
  );
}

export default DocumentComplete;