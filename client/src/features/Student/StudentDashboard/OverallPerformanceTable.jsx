import React, { useState } from "react";
import { useSelector } from "react-redux";

// Helper function to format time spent in hours:minutes:seconds
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Helper function to format date to year/month/day
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
};

const StudentDashboard = () => {
  const [selectedCourseId, setSelectedCourseId] = useState(""); // State for the selected course filter
  const [selectedLessonId, setSelectedLessonId] = useState(""); // State for the selected lesson filter
  const [selectedContentType, setSelectedContentType] = useState(""); // State for filtering content type (document/quiz/activity)
  const courseData = useSelector((state) => state.course.courseData);
  const userAnalytics = useSelector((state) => state.userAnalytics.userAnalytics);
  const userProgress = useSelector((state) => state.studentProgress.userProgress);

  // Handle course filter change
  const handleCourseFilterChange = (event) => {
    setSelectedCourseId(event.target.value);
    setSelectedLessonId(""); // Reset the lesson filter when the course changes
  };

  // Handle lesson filter change
  const handleLessonFilterChange = (event) => {
    setSelectedLessonId(event.target.value);
  };

  // Handle content type filter change
  const handleContentTypeChange = (event) => {
    setSelectedContentType(event.target.value);
  };

  // Filter courseData based on the selected course and lesson
  const filteredCourses = selectedCourseId
    ? courseData.filter(course => course._id === selectedCourseId)
    : courseData;

  const filteredLessons = selectedLessonId
    ? filteredCourses.map(course => ({
        ...course,
        lessons: course.lessons.filter(lesson => lesson._id === selectedLessonId)
      }))
    : filteredCourses;

  const filteredContent = filteredLessons.map(course => ({
    ...course,
    lessons: course.lessons.map(lesson => ({
      ...lesson,
      documents: selectedContentType === "documents" || selectedContentType === "" ? lesson.documents : [],
      quiz: selectedContentType === "quizzes" || selectedContentType === "" ? lesson.quiz : [],
      activities: selectedContentType === "activities" || selectedContentType === "" ? lesson.activities : [],
    }))
  }));

  return (
    <div className="p-6">
      {/* Course filter dropdown */}
      Course PerformanceTable
      <div className="mb-4">
        <label htmlFor="courseFilter" className="block mb-2 text-sm font-medium text-gray-700">
          Filter by Course:
        </label>
        <select
          id="courseFilter"
          className="block w-full p-2 border border-gray-300 rounded-md"
          value={selectedCourseId}
          onChange={handleCourseFilterChange}
        >
          <option value="">All Courses</option>
          {courseData.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Lesson filter dropdown (only visible when a course is selected) */}
      {selectedCourseId && (
        <div className="mb-4">
          <label htmlFor="lessonFilter" className="block mb-2 text-sm font-medium text-gray-700">
            Filter by Lesson:
          </label>
          <select
            id="lessonFilter"
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={selectedLessonId}
            onChange={handleLessonFilterChange}
          >
            <option value="">All Lessons</option>
            {filteredCourses[0]?.lessons.map(lesson => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content type filter dropdown */}
      <div className="mb-4">
        <label htmlFor="contentTypeFilter" className="block mb-2 text-sm font-medium text-gray-700">
          Filter by Content Type:
        </label>
        <select
          id="contentTypeFilter"
          className="block w-full p-2 border border-gray-300 rounded-md"
          value={selectedContentType}
          onChange={handleContentTypeChange}
        >
          <option value="">All Content Types</option>
          <option value="documents">Documents</option>
          <option value="quizzes">Quizzes</option>
          <option value="activities">Activities</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-gray-600">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left">Course</th>
              <th className="py-3 px-4 text-left">Lesson</th>
              <th className="py-3 px-4 text-left">Document/Quiz/Activity</th>
              <th className="py-3 px-4 text-left">Time Spent</th>
              <th className="py-3 px-4 text-left">Points Earned</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date Finished</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((course) => {
              const courseAnalytics = userAnalytics.coursesAnalytics.find((ca) =>
                (typeof ca.courseId === 'object' && ca.courseId._id
                  ? ca.courseId._id.toString()
                  : ca.courseId.toString()) === course._id.toString()
              );

              const courseProgress = userProgress.coursesProgress.find(
                (cp) => cp.courseId.toString() === course._id.toString()
              );

              return (
                <React.Fragment key={course._id}>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="py-3 px-4 font-semibold" rowSpan={course.lessons.reduce((sum, lesson) => sum + lesson.documents.length + lesson.quiz.length + lesson.activities.length + 1, 1)}>
                      {course.title}
                    </td>
                    <td colSpan="6"></td>
                  </tr>
                  {course.lessons.map((lesson) => {
                    const lessonAnalytics = courseAnalytics.lessonsAnalytics.find(
                      (la) => la.lessonId.toString() === lesson._id.toString()
                    );
                    const lessonProgress = courseProgress.lessonsProgress.find(
                      (lp) => lp.lessonId.toString() === lesson._id.toString()
                    );

                    return (
                      <React.Fragment key={lesson._id}>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td className="py-3 px-4 font-semibold" rowSpan={lesson.documents.length + lesson.quiz.length + lesson.activities.length + 1}>
                            {lesson.title}
                          </td>
                          <td colSpan="6"></td>
                        </tr>
                        {lesson.documents.map((doc) => {
                          const docAnalytics = lessonAnalytics.documentsAnalytics.find(
                            (da) => da.documentId.toString() === doc._id.toString()
                          );
                          const docProgress = lessonProgress.documentsProgress.find(
                            (dp) => dp.documentId.toString() === doc._id.toString()
                          );

                          return (
                            <tr key={doc._id} className="bg-white border-b border-gray-200">
                              <td className="py-3 px-4">Document: {doc.title}</td>
                              <td className="py-3 px-4">{docAnalytics ? formatTime(docAnalytics.timeSpent) : "N/A"}</td>
                              <td className="py-3 px-4">{docAnalytics ? docAnalytics.pointsEarned : "N/A"}</td>
                              <td className="py-3 px-4">{docProgress ? (docProgress.locked ? "Unfinished" : "Finished") : "N/A"}</td>
                              <td className="py-3 px-4">{docProgress ? formatDate(docProgress.dateFinished) : "N/A"}</td>
                            </tr>
                          );
                        })}

                        {lesson.quiz.map((quiz) => {
                          const quizAnalytics = lessonAnalytics.quizzesAnalytics.find(
                            (qa) => qa.quizId.toString() === quiz._id.toString()
                          );
                          const quizProgress = lessonProgress.quizzesProgress.find(
                            (qp) => qp.quizId.toString() === quiz._id.toString()
                          );

                          return (
                            <tr key={quiz._id} className="bg-white border-b border-gray-200">
                              <td className="py-3 px-4">Quiz: {quiz.title}</td>
                              <td className="py-3 px-4">{quizAnalytics ? formatTime(quizAnalytics.timeSpent) : "N/A"}</td>
                              <td className="py-3 px-4">{quizAnalytics ? quizAnalytics.pointsEarned : "N/A"}</td>
                              <td className="py-3 px-4">{quizProgress ? (quizProgress.locked ? "Unfinished" : "Finished") : "N/A"}</td>
                              <td className="py-3 px-4">{quizProgress ? formatDate(quizProgress.dateFinished) : "N/A"}</td>
                            </tr>
                          );
                        })}

                        {lesson.activities.map((activity) => {
                          const activityAnalytics = lessonAnalytics.activitiesAnalytics.find(
                            (aa) => aa.activityId.toString() === activity._id.toString()
                          );
                          const activityProgress = lessonProgress.activitiesProgress.find(
                            (ap) => ap.activityId.toString() === activity._id.toString()
                          );

                          return (
                            <tr key={activity._id} className="bg-white border-b border-gray-200">
                              <td className="py-3 px-4">Activity: {activity.title}</td>
                              <td className="py-3 px-4">{activityAnalytics ? formatTime(activityAnalytics.timeSpent) : "N/A"}</td>
                              <td className="py-3 px-4">{activityAnalytics ? activityAnalytics.pointsEarned : "N/A"}</td>
                              <td className="py-3 px-4">{activityProgress ? (activityProgress.locked ? "Unfinished" : "Finished") : "N/A"}</td>
                              <td className="py-3 px-4">{activityProgress ? formatDate(activityProgress.dateFinished) : "N/A"}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
