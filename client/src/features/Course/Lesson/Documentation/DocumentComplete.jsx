import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";

function DocumentComplete() {
  const { courseId, lessonId, documentId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);

  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

  //for documents
  const currentDocumentIndex = lesson.documents.findIndex(
    (doc) => doc._id === documentId
  );
  const nextDocument = lesson.documents[currentDocumentIndex + 1];

  //for quiz
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
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4">Document Completed</h1>
      <p className="mb-4">You have completed this document. Great job!</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleNext}
      >
        {nextDocument && "Next Document"}
        {!nextDocument && nextQuizIndex < lesson.quiz.length && "Take Quiz"}
      </button>
    </div>
  );
}

export default DocumentComplete;
