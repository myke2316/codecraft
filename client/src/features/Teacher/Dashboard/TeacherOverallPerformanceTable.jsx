import React, { useState } from "react";
import { useSelector } from "react-redux";

// Helper function to format time spent in hours:minutes:seconds
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

// Helper function to format date to year/month/day
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

// Helper function to calculate the total time spent and points earned
const calculateTotals = (items) => {
  let totalTime = 0;
  let totalPoints = 0;
  let allLocked = true;

  items.forEach((item) => {
    if (item.analytics) {
      totalTime += item.analytics.timeSpent || 0;
      totalPoints += item.analytics.pointsEarned || 0;
    }
    if (item.progress && !item.progress.locked) {
      allLocked = false;
    }
  });

  return {
    totalTime,
    totalPoints,
    status: allLocked ? "In progress" : "Finished",
  };
};

const TeacherOverallPerformanceTable = ({ userAnalytics, userProgress }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(""); // State for the selected course filter
  const [selectedLessonId, setSelectedLessonId] = useState(""); // State for the selected lesson filter
  const [selectedContentType, setSelectedContentType] = useState(""); // State for filtering content type (document/quiz/activity)
  const [expandedCourses, setExpandedCourses] = useState({}); // State for expanded courses
  const [expandedLessons, setExpandedLessons] = useState({}); // State for expanded lessons
  const [expandedContent, setExpandedContent] = useState({}); // State for expanded content

  const courseData = useSelector((state) => state.course.courseData);
  // const userAnalytics = useSelector(
  //   (state) => state.userAnalytics.userAnalytics
  // );
  // const userProgress = useSelector(
  //   (state) => state.studentProgress.userProgress
  // );

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

  // Toggle course expansion
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses((prevState) => ({
      ...prevState,
      [courseId]: !prevState[courseId],
    }));
  };

  // Toggle lesson expansion
  const toggleLessonExpansion = (lessonId) => {
    setExpandedLessons((prevState) => ({
      ...prevState,
      [lessonId]: !prevState[lessonId],
    }));
  };

  // Toggle content (documents, quizzes, activities) expansion
  const toggleContentExpansion = (lessonId, contentType) => {
    setExpandedContent((prevState) => ({
      ...prevState,
      [`${lessonId}-${contentType}`]: !prevState[`${lessonId}-${contentType}`],
    }));
  };

  // Filter courseData based on the selected course and lesson
  const filteredCourses = selectedCourseId
    ? courseData.filter((course) => course._id === selectedCourseId)
    : courseData;

  const filteredLessons = selectedLessonId
    ? filteredCourses.map((course) => ({
        ...course,
        lessons: course.lessons.filter(
          (lesson) => lesson._id === selectedLessonId
        ),
      }))
    : filteredCourses;

  const filteredContent = filteredLessons.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      documents:
        selectedContentType === "documents" || selectedContentType === ""
          ? lesson.documents
          : [],
      quiz:
        selectedContentType === "quizzes" || selectedContentType === ""
          ? lesson.quiz
          : [],
      activities:
        selectedContentType === "activities" || selectedContentType === ""
          ? lesson.activities
          : [],
    })),
  }));

  return (
    <div className="p-6">
      {/* Course filter dropdown */}
      <div className="mb-4">
        <label
          htmlFor="courseFilter"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Filter by Course:
        </label>
        <select
          id="courseFilter"
          className="block w-full p-2 border border-gray-300 rounded-md"
          value={selectedCourseId}
          onChange={handleCourseFilterChange}
        >
          <option value="">All Courses</option>
          {courseData.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Lesson filter dropdown (only visible when a course is selected) */}
      {selectedCourseId && (
        <div className="mb-4">
          <label
            htmlFor="lessonFilter"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Filter by Lesson:
          </label>
          <select
            id="lessonFilter"
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={selectedLessonId}
            onChange={handleLessonFilterChange}
          >
            <option value="">All Lessons</option>
            {filteredCourses[0]?.lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content type filter dropdown */}
      <div className="mb-4">
        <label
          htmlFor="contentTypeFilter"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
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

              <th className="py-3 px-4 text-left">Time Spent</th>
              <th className="py-3 px-4 text-left">Points Earned</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              {/* No Date column since it's omitted when content is collapsed */}
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((course) => {
              const courseAnalytics = userAnalytics.coursesAnalytics.find(
                (ca) =>
                  (typeof ca.courseId === "object" && ca.courseId._id
                    ? ca.courseId._id.toString()
                    : ca.courseId.toString()) === course._id.toString()
              );

              const courseProgress = userProgress.coursesProgress.find(
                (cp) => cp.courseId.toString() === course._id.toString()
              );
              const courseTotals = calculateTotals(
                course.lessons.flatMap((lesson) => [
                  ...lesson.documents.map((doc) => ({
                    analytics: courseAnalytics?.lessonsAnalytics
                      .find(
                        (la) => la.lessonId.toString() === lesson._id.toString()
                      )
                      ?.documentsAnalytics.find(
                        (da) => da.documentId.toString() === doc._id.toString()
                      ),
                    progress: courseProgress?.lessonsProgress
                      .find(
                        (lp) => lp.lessonId.toString() === lesson._id.toString()
                      )
                      ?.documentsProgress.find(
                        (dp) => dp.documentId.toString() === doc._id.toString()
                      ),
                  })),
                  ...lesson.quiz.map((quiz) => ({
                    analytics: courseAnalytics?.lessonsAnalytics
                      .find(
                        (la) => la.lessonId.toString() === lesson._id.toString()
                      )
                      ?.quizzesAnalytics.find(
                        (qa) => qa.quizId.toString() === quiz._id.toString()
                      ),
                    progress: courseProgress?.lessonsProgress
                      .find(
                        (lp) => lp.lessonId.toString() === lesson._id.toString()
                      )
                      ?.quizzesProgress.find(
                        (qp) => qp.quizId.toString() === quiz._id.toString()
                      ),
                  })),
                  ...lesson.activities.map((activity) => ({
                    analytics: courseAnalytics?.lessonsAnalytics
                      .find(
                        (la) => la.lessonId.toString() === lesson._id.toString()
                      )
                      ?.activitiesAnalytics.find(
                        (aa) =>
                          aa.activityId.toString() === activity._id.toString()
                      ),
                    progress: courseProgress?.lessonsProgress
                      .find(
                        (lp) => lp.lessonId.toString() === lesson._id.toString()
                      )
                      ?.activitiesProgress.find(
                        (ap) =>
                          ap.activityId.toString() === activity._id.toString()
                      ),
                  })),
                ])
              );
              const isCourseAllFinished = courseProgress
                ? courseProgress.lessonsProgress.every((lesson) => {
                    // Check if the lesson itself has a dateFinished
                    if (!lesson.dateFinished) {
                      return false;
                    }

                    // Check if all documents in the lesson have a dateFinished
                    const areAllDocumentsFinished =
                      lesson.documentsProgress.every(
                        (doc) => doc.dateFinished !== null
                      );

                    // Check if all quizzes in the lesson have a dateFinished
                    const areAllQuizzesFinished = lesson.quizzesProgress.every(
                      (quiz) => quiz.dateFinished !== null
                    );

                    // Check if all activities in the lesson have a dateFinished
                    const areAllActivitiesFinished =
                      lesson.activitiesProgress.every(
                        (activity) => activity.dateFinished !== null
                      );

                    // The lesson is considered finished if all its parts are finished
                    return (
                      lesson.dateFinished !== null &&
                      areAllDocumentsFinished &&
                      areAllQuizzesFinished &&
                      areAllActivitiesFinished
                    );
                  })
                : false;
              return (
                <React.Fragment key={course._id}>
                  <tr
                    className="bg-gray-50 border-b border-gray-200 cursor-pointer"
                    onClick={() => toggleCourseExpansion(course._id)}
                  >
                    <td className="py-3 px-4 font-semibold">
                      {expandedCourses[course._id] ? "▼" : "►"} {course.title}
                    </td>
                    <td className="py-3 px-4">
                      {formatTime(courseTotals.totalTime)}
                    </td>
                    <td className="py-3 px-4">{courseTotals.totalPoints}</td>
                    <td className="py-3 px-4">
                      {isCourseAllFinished ? "Finished" : "In Progress"}
                    </td>{" "}
                    <td className="py-3 px-4">
                      {courseProgress?.dateFinished
                        ? formatDate(courseProgress.dateFinished)
                        : "In Progress"}
                    </td>
                  </tr>
                  {expandedCourses[course._id] &&
                    course.lessons.map((lesson) => {
                      const lessonAnalytics =
                        courseAnalytics.lessonsAnalytics.find(
                          (la) =>
                            la.lessonId.toString() === lesson._id.toString()
                        );
                      const lessonProgress =
                        courseProgress.lessonsProgress.find(
                          (lp) =>
                            lp.lessonId.toString() === lesson._id.toString()
                        );

                      // Calculate totals for documents, quizzes, and activities
                      const documentTotals = calculateTotals(
                        lesson.documents.map((doc) => ({
                          analytics: lessonAnalytics.documentsAnalytics.find(
                            (da) =>
                              da.documentId.toString() === doc._id.toString()
                          ),
                          progress: lessonProgress.documentsProgress.find(
                            (dp) =>
                              dp.documentId.toString() === doc._id.toString()
                          ),
                        }))
                      );

                      const isAllDocumentsFinished = lesson.documents.every(
                        (doc) => {
                          const docProgress =
                            lessonProgress.documentsProgress.find(
                              (dp) =>
                                dp.documentId.toString() === doc._id.toString()
                            );
                          return docProgress?.dateFinished !== null;
                        }
                      );
                      const quizTotals = calculateTotals(
                        lesson.quiz.map((quiz) => ({
                          analytics: lessonAnalytics.quizzesAnalytics.find(
                            (qa) => qa.quizId.toString() === quiz._id.toString()
                          ),
                          progress: lessonProgress.quizzesProgress.find(
                            (qp) => qp.quizId.toString() === quiz._id.toString()
                          ),
                        }))
                      );

                      const activityTotals = calculateTotals(
                        lesson.activities.map((activity) => ({
                          analytics: lessonAnalytics.activitiesAnalytics.find(
                            (aa) =>
                              aa.activityId.toString() ===
                              activity._id.toString()
                          ),
                          progress: lessonProgress.activitiesProgress.find(
                            (ap) =>
                              ap.activityId.toString() ===
                              activity._id.toString()
                          ),
                        }))
                      );
                      const activityMisc = lesson.activities.map((activity) => {
                        const activityProgress =
                          lessonProgress.activitiesProgress.find(
                            (ap) =>
                              ap.activityId.toString() ===
                              activity._id.toString()
                          );
                        return activityProgress;
                      });

                      const isActivityAllFinished = activityMisc.every(
                        (progress) => {
                          if (progress.dateFinished !== null) {
                            return true;
                          } else {
                            return false;
                          }
                        }
                      );
                      const isAllLessonFinished = lessonProgress
                        ? [
                            // Check if all documents in the lesson are finished
                            ...lesson.documents.map((doc) => {
                              const docProgress =
                                lessonProgress.documentsProgress.find(
                                  (dp) =>
                                    dp.documentId.toString() ===
                                    doc._id.toString()
                                );
                              return docProgress?.dateFinished !== null;
                            }),

                            // Check if all quizzes in the lesson are finished
                            ...lesson.quiz.map((quiz) => {
                              const quizProgress =
                                lessonProgress.quizzesProgress.find(
                                  (qp) =>
                                    qp.quizId.toString() === quiz._id.toString()
                                );
                              return quizProgress?.dateFinished !== null;
                            }),

                            // Check if all activities in the lesson are finished
                            ...lesson.activities.map((activity) => {
                              const activityProgress =
                                lessonProgress.activitiesProgress.find(
                                  (ap) =>
                                    ap.activityId.toString() ===
                                    activity._id.toString()
                                );
                              return activityProgress?.dateFinished !== null;
                            }),
                          ].every((finished) => finished) // Check if all progress items have dateFinished
                        : false; // If lessonProgress is not found, set isAllLessonFinished to false

                      const lessonTotals = calculateTotals([
                        ...lesson.documents.map((doc) => ({
                          analytics: lessonAnalytics?.documentsAnalytics.find(
                            (da) =>
                              da.documentId.toString() === doc._id.toString()
                          ),
                          progress: lessonProgress?.documentsProgress.find(
                            (dp) =>
                              dp.documentId.toString() === doc._id.toString()
                          ),
                        })),
                        ...lesson.quiz.map((quiz) => ({
                          analytics: lessonAnalytics?.quizzesAnalytics.find(
                            (qa) => qa.quizId.toString() === quiz._id.toString()
                          ),
                          progress: lessonProgress?.quizzesProgress.find(
                            (qp) => qp.quizId.toString() === quiz._id.toString()
                          ),
                        })),
                        ...lesson.activities.map((activity) => ({
                          analytics: lessonAnalytics?.activitiesAnalytics.find(
                            (aa) =>
                              aa.activityId.toString() ===
                              activity._id.toString()
                          ),
                          progress: lessonProgress?.activitiesProgress.find(
                            (ap) =>
                              ap.activityId.toString() ===
                              activity._id.toString()
                          ),
                        })),
                      ]);
                      return (
                        <React.Fragment key={lesson._id}>
                          <tr
                            className="bg-gray-100 border-b border-gray-200 cursor-pointer"
                            onClick={() => toggleLessonExpansion(lesson._id)}
                          >
                            <td className="py-3 px-4 pl-8 font-medium">
                              {expandedLessons[lesson._id] ? "▼" : "►"}{" "}
                              {lesson.title}
                            </td>
                            <td className="py-3 px-4">
                              {formatTime(lessonTotals.totalTime)}
                            </td>
                            <td className="py-3 px-4">
                              {lessonTotals.totalPoints}
                            </td>
                            <td className="py-3 px-4">
                              {isAllLessonFinished ? "Finished" : "In Progress"}
                            </td>
                            <td className="py-3 px-4">
                              {lessonProgress?.dateFinished
                                ? formatDate(lessonProgress.dateFinished)
                                : "In Progress"}
                            </td>
                          </tr>
                          {expandedLessons[lesson._id] && (
                            <>
                              <tr
                                className="bg-gray-200 border-b border-gray-300 cursor-pointer"
                                onClick={() =>
                                  toggleContentExpansion(
                                    lesson._id,
                                    "documents"
                                  )
                                }
                              >
                                <td className="py-3 px-4 pl-16 font-medium">
                                  {expandedContent[`${lesson._id}-documents`]
                                    ? "▼"
                                    : "►"}{" "}
                                  Documents
                                </td>
                                <td className="py-3 px-4">
                                  {formatTime(documentTotals.totalTime)}
                                </td>
                                <td className="py-3 px-4">
                                  {documentTotals.totalPoints}
                                </td>
                                <td className="py-3 px-4">
                                  <td className="py-3 px-4">
                                    {isAllDocumentsFinished
                                      ? "Finished"
                                      : "In Progress"}
                                  </td>
                                </td>
                                <td colSpan="2"></td>
                              </tr>
                              {expandedContent[`${lesson._id}-documents`] &&
                                lesson.documents.map((doc) => {
                                  const docAnalytics =
                                    lessonAnalytics.documentsAnalytics.find(
                                      (da) =>
                                        da.documentId.toString() ===
                                        doc._id.toString()
                                    );
                                  const docProgress =
                                    lessonProgress.documentsProgress.find(
                                      (dp) =>
                                        dp.documentId.toString() ===
                                        doc._id.toString()
                                    );
                                  console.log(docProgress);
                                  return (
                                    <tr
                                      key={doc._id}
                                      className="bg-white border-b border-gray-200"
                                    >
                                      <td className="py-3 px-4 pl-24">
                                        {doc.title}
                                      </td>
                                      <td className="py-3 px-4">
                                        {docAnalytics
                                          ? formatTime(docAnalytics.timeSpent)
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {docAnalytics
                                          ? docAnalytics.pointsEarned
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {docProgress
                                          ? !docProgress.dateFinished
                                            ? "In progress"
                                            : "Finished"
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {docProgress.dateFinished !== null
                                          ? formatDate(docProgress.dateFinished)
                                          : "In Progress"}
                                      </td>
                                    </tr>
                                  );
                                })}

                              <tr
                                className="bg-gray-200 border-b border-gray-300 cursor-pointer"
                                onClick={() =>
                                  toggleContentExpansion(lesson._id, "quizzes")
                                }
                              >
                                <td className="py-3 px-4 pl-16 font-medium">
                                  {expandedContent[`${lesson._id}-quizzes`]
                                    ? "▼"
                                    : "►"}{" "}
                                  Quizzes
                                </td>
                                <td className="py-3 px-4">
                                  {formatTime(quizTotals.totalTime)}
                                </td>
                                <td className="py-3 px-4">
                                  {quizTotals.totalPoints}
                                </td>
                                <td className="py-3 px-4">
                                  {quizTotals.totalPoints
                                    ? "Finished"
                                    : "In Progress"}
                                </td>
                                <td colSpan="2"></td>
                              </tr>
                              {expandedContent[`${lesson._id}-quizzes`] &&
                                lesson.quiz.map((quiz, index) => {
                                  const quizAnalytics =
                                    lessonAnalytics.quizzesAnalytics.find(
                                      (qa) =>
                                        qa.quizId.toString() ===
                                        quiz._id.toString()
                                    );
                                  // const quizProgress =
                                  //   lessonProgress.quizzesProgress.find(
                                  //     (qp) =>
                                  //       qp.quizId.toString() ===
                                  //       quiz._id.toString()
                                  // );
                                  const quizProgress =
                                    lessonProgress.quizzesProgress[0];
                                  console.log(quizProgress);
                                  return (
                                    <tr
                                      key={quiz._id}
                                      className="bg-white border-b border-gray-200"
                                    >
                                      <td className="py-3 px-4 pl-24">
                                        Item #{index + 1}
                                      </td>
                                      <td className="py-3 px-4">
                                        {quizAnalytics
                                          ? formatTime(quizAnalytics.timeSpent)
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {quizAnalytics
                                          ? quizAnalytics.pointsEarned
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {quizProgress
                                          ? !quizProgress.dateFinished
                                            ? "In progress"
                                            : "Finished"
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {quizProgress &&
                                        quizProgress.dateFinished !== null
                                          ? formatDate(
                                              quizProgress.dateFinished
                                            )
                                          : "In Progress"}
                                      </td>
                                    </tr>
                                  );
                                })}

                              <tr
                                className="bg-gray-200 border-b border-gray-300 cursor-pointer"
                                onClick={() =>
                                  toggleContentExpansion(
                                    lesson._id,
                                    "activities"
                                  )
                                }
                              >
                                <td className="py-3 px-4 pl-16 font-medium">
                                  {expandedContent[`${lesson._id}-activities`]
                                    ? "▼"
                                    : "►"}{" "}
                                  Activities
                                </td>
                                <td className="py-3 px-4">
                                  {formatTime(activityTotals.totalTime)}
                                </td>
                                <td className="py-3 px-4">
                                  {activityTotals.totalPoints}
                                </td>
                                <td className="py-3 px-4">
                                  {isActivityAllFinished
                                    ? "Finished"
                                    : "In Progress"}
                                </td>
                                <td colSpan="2"></td>
                              </tr>
                              {expandedContent[`${lesson._id}-activities`] &&
                                lesson.activities.map((activity) => {
                                  const activityAnalytics =
                                    lessonAnalytics.activitiesAnalytics.find(
                                      (aa) =>
                                        aa.activityId.toString() ===
                                        activity._id.toString()
                                    );
                                  const activityProgress =
                                    lessonProgress.activitiesProgress.find(
                                      (ap) =>
                                        ap.activityId.toString() ===
                                        activity._id.toString()
                                    );
                                  console.log(activityProgress);
                                  return (
                                    <tr
                                      key={activity._id}
                                      className="bg-white border-b border-gray-200"
                                    >
                                      <td className="py-3 px-4 pl-24">
                                        {activity.title}
                                      </td>
                                      <td className="py-3 px-4">
                                        {activityAnalytics
                                          ? formatTime(
                                              activityAnalytics.timeSpent
                                            )
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {activityAnalytics
                                          ? activityAnalytics.pointsEarned
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {activityProgress
                                          ? activityProgress.dateFinished ===
                                            null
                                            ? "In progress"
                                            : "Finished"
                                          : "In Progress"}
                                      </td>
                                      <td className="py-3 px-4">
                                        {activityProgress &&
                                        activityProgress.dateFinished !== null
                                          ? formatDate(
                                              activityProgress.dateFinished
                                            )
                                          : "In Progress"}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </>
                          )}
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

export default TeacherOverallPerformanceTable;
