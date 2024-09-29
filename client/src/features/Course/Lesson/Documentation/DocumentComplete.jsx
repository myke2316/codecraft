import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { Card, CardContent, Button, Typography, Box } from "@mui/material";

function DocumentComplete() {
  const { courseId, lessonId, documentId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);

  const location = useLocation();
  const totalTimeSpent = location.state?.formattedTime; // Access the totalTimeSpent state

  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

  // For documents
  const currentDocumentIndex = lesson.documents.findIndex(
    (doc) => doc._id === documentId
  );
  const nextDocument = lesson.documents[currentDocumentIndex + 1];
  
  // For quiz
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
    <Box className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardContent className="p-6">
          <Typography variant="h5" className="text-3xl font-bold mb-6 text-center">
            Document Completed
          </Typography>
          <Typography variant="body1" className="mb-4 text-center">
            You have completed this document. Great job!
          </Typography>
          <Typography variant="body2" className="text-center mb-8">
            You spent {totalTimeSpent} to finish this.
          </Typography>
          <Box className="flex justify-center">
            <Button
              variant="contained"
              color="primary"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleNext}
            >
              {nextDocument && "Next Document"}
              {!nextDocument && nextQuizIndex < lesson.quiz.length && "Take Quiz"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DocumentComplete;
