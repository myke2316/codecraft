import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";

function CourseSidebar() {
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );
  const location = useLocation();

  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );
console.log(userAnalytics)
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const courseIdFromUrl = pathSegments[2]; // Extract courseId from URL
    const lessonIdFromUrl = pathSegments[4]; // Extract lessonId from URL

    if (courseIdFromUrl && lessonIdFromUrl) {
      setExpandedCourseId(courseIdFromUrl);
      setExpandedLessonId(lessonIdFromUrl);
    }
  }, [location]);
  const handleCourseToggle = (courseId) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  const handleLessonToggle = (lessonId) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  const handleLessonClick = (lessonId, courseId) => {
    navigate(`/course/${courseId}/lesson/${lessonId}`);
    handleLessonToggle(lessonId);
  };

  const handleDocumentClick = (courseId, documentId, lessonId) => {
    navigate(`/course/${courseId}/lesson/${lessonId}/document/${documentId}`);
  };

  const handleQuizClick = (courseId, lessonId) => {
    const course = courses.find((course) => course._id === courseId);
    const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
    const quizzes = lesson.quiz;
    navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${quizzes[0]._id}`);
  };

  const handleActivityClick = (courseId, lessonId) => {
    navigate(`/course/${courseId}/lesson/${lessonId}/activity/activityList`);
  };

  return (
    <div style={{ width: "300px", padding: "16px" }}>
      {courses.map((course) => {
        const courseProgress = userProgress.coursesProgress.find(
          (cp) => cp.courseId.toString() === course._id.toString()
        );
        if (!courseProgress) return null;

        const isCourseExpanded = expandedCourseId === course._id;

        return (
          <Card key={course._id} sx={{ marginBottom: 2, boxShadow: 3 }}>
            <Accordion
              expanded={isCourseExpanded}
              onChange={() => handleCourseToggle(course._id)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${course._id}-content`}
                id={`panel-${course._id}-header`}
              >
                <Typography variant="h6">{course.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {course.lessons.map((lesson) => {
                    const lessonProgress = courseProgress.lessonsProgress.find(
                      (lp) => lp.lessonId.toString() === lesson._id.toString()
                    );
                    if (!lessonProgress) return null;

                    const isLessonUnlocked = !lessonProgress.locked;
                    const isLessonExpanded = expandedLessonId === lesson._id;

                    const isQuizUnlocked =
                      !lessonProgress.quizzesProgress[0].locked;
                    const isActivityUnlocked =
                      !lessonProgress.activitiesProgress[0].locked;

                    return (
                      <div key={lesson._id}>
                        <Accordion
                          expanded={isLessonExpanded}
                          onChange={() => handleLessonToggle(lesson._id)}
                          sx={{ marginBottom: 1, boxShadow: 2 }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${lesson._id}-content`}
                            id={`panel-${lesson._id}-header`}
                            onClick={() =>
                              isLessonUnlocked &&
                              handleLessonClick(lesson._id, course._id)
                            }
                            sx={{
                              cursor: isLessonUnlocked
                                ? "pointer"
                                : "not-allowed",
                              opacity: isLessonUnlocked ? 1 : 0.5,
                            }}
                          >
                            <ListItemIcon>
                              {isLessonUnlocked ? (
                                <FolderOpenIcon color="primary" />
                              ) : (
                                <LockIcon color="disabled" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={lesson.title} />
                          </AccordionSummary>
                          <AccordionDetails>
                            <List>
                              {/* Lesson Documents */}
                              {lesson.documents.map((document) => {
                                const documentProgress =
                                  lessonProgress.documentsProgress.find(
                                    (dp) =>
                                      dp.documentId.toString() ===
                                      document._id.toString()
                                  );
                                if (!documentProgress) return null;

                                const isDocumentUnlocked =
                                  !documentProgress.locked;

                                return (
                                  <ListItem
                                    key={document._id}
                                    button
                                    sx={{
                                      cursor: isDocumentUnlocked
                                        ? "pointer"
                                        : "not-allowed",
                                      opacity: isDocumentUnlocked ? 1 : 0.5,
                                      paddingLeft: 4,
                                    }}
                                    onClick={() =>
                                      isDocumentUnlocked &&
                                      handleDocumentClick(
                                        course._id,
                                        document._id,
                                        lesson._id
                                      )
                                    }
                                  >
                                    <ListItemIcon>
                                      <DescriptionIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={document.title} />
                                  </ListItem>
                                );
                              })}

                              {/* Divider between documents and quiz/activity */}
                              <Divider sx={{ my: 1 }} />

                              {/* Quiz Section */}
                              <ListItem
                                button
                                onClick={() =>
                                  isQuizUnlocked &&
                                  handleQuizClick(course._id, lesson._id)
                                }
                                sx={{
                                  cursor: isQuizUnlocked
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isQuizUnlocked ? 1 : 0.5,
                                  paddingLeft: 4,
                                }}
                              >
                                <ListItemIcon>
                                  <QuizIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText primary="Quiz" />
                              </ListItem>

                              {/* Activity Section */}
                              <ListItem
                                button
                                onClick={() =>
                                  isActivityUnlocked &&
                                  handleActivityClick(course._id, lesson._id)
                                }
                                sx={{
                                  cursor: isActivityUnlocked
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isActivityUnlocked ? 1 : 0.5,
                                  paddingLeft: 4,
                                }}
                              >
                                <ListItemIcon>
                                  <AssignmentIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText primary="Activity" />
                              </ListItem>
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      </div>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          </Card>
        );
      })}
    </div>
  );
}

export default CourseSidebar;
