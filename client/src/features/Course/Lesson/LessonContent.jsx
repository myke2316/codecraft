import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

function LessonContent() {
  const { courseId, lessonId } = useParams();
  const courses = useSelector((state) => state.course.courseData);
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );
  const navigate = useNavigate();

  function handleClick(id) {
    navigate(`document/${id}`);
  }

  if (!courses || !userProgress)
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );

  const course = courses.find((course) => course._id === courseId);
  if (!course)
    return (
      <div className="flex justify-center items-center h-full">
        Course not found
      </div>
    );

  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  if (!lesson)
    return (
      <div className="flex justify-center items-center h-full">
        Lesson not found
      </div>
    );

  const documents = lesson.documents;
  const quizzes = lesson.quiz;
  const activities = lesson.activities;

  const lessonProgress = userProgress.coursesProgress
    .find((cp) => cp.courseId.toString() === courseId.toString())
    .lessonsProgress.find(
      (lp) => lp.lessonId.toString() === lessonId.toString()
    );

  if (!lessonProgress)
    return (
      <div className="flex justify-center items-center h-full">
        Lesson progress not found
      </div>
    );

  const completedDocuments = lessonProgress.documentsProgress.filter(
    (dp) => dp.locked === false
  ).length;
  const totalDocuments = documents.length;
  const progressPercentage = (completedDocuments / totalDocuments) * 100;

  const quizProgress = lessonProgress.quizzesProgress[0];
  console.log(quizProgress)
  const quizScore = quizProgress?.locked
    ? "Locked"
    : `${quizProgress?.pointsEarned} Points Earned`;

  function handleQuizClick() {
    navigate(`quiz/${quizzes[0]._id}`);
  }

  function handleActivityClick() {
    navigate(`activity/${activities[0]._id}`);
  }

  return (
    <div className="flex-1 p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {lesson.title}
        </h1>
        <hr className="mb-6" />
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold">
            Progress: {completedDocuments}/{totalDocuments}
          </span>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden ml-4">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${progressPercentage}%`,
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Documents
          </h2>
          <ul className="space-y-4">
            {documents.map((document) => {
              const docProgress = lessonProgress.documentsProgress.find(
                (dp) => dp.documentId.toString() === document._id.toString()
              );
              return (
                <li key={document._id}>
                  <span
                    className={`block p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      docProgress?.locked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed disabled:true"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                    }`}
                    onClick={docProgress?.locked ? null : () => handleClick(document._id)}
                  >
                    {document.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Only display quiz section if quizzes are present */}
        {quizzes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Quiz</h2>
            <div
              className={`block p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                quizProgress?.locked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100"
              }`}
              onClick={quizProgress?.locked ? null : handleQuizClick}
            >
              Quiz - {quizScore}
            </div>
          </div>
        )}

        {/* Only display activities section if activities are present */}
        {activities.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Coding Activities
            </h2>
            <ul className="space-y-4">
              {activities.map((activity) => {
                const activityProgress =
                  lessonProgress.activitiesProgress.find(
                    (cap) => cap.activityId.toString() === activity._id.toString()
                  );
                return (
                  <li key={activity._id}>
                    <span
                      className={`block p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        activityProgress?.locked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                      }`}
                      onClick={activityProgress?.locked ? null : handleActivityClick}
                    >
                      {activity.title} - X
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonContent;
