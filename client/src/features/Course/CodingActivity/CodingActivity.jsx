import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { Editor } from "@monaco-editor/react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckIcon from "@mui/icons-material/Check";
import SendIcon from "@mui/icons-material/Send";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdateUserProgressMutation } from "../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../Student/studentCourseProgressSlice";
import {
  useDecrementActivitySubmissionMutation,
  useUpdateUserActivitySubmissionMutation,
} from "./activitySubmissionService";
import { updateActivitySubmissionUtil } from "../../../utils/activitySubmissionUtil";
import { setDecrementTries } from "./activitySubmissionSlice";
import { useUpdateUserAnalyticsMutation } from "../../Student/userAnalyticsService";
import { updateUserAnalytics } from "../../Student/userAnalyticsSlice";
import { BACKEND_URL } from "../../../constants";
import OutputPanel from "./OutputPanel";
import CodeIcon from "@mui/icons-material/Code"; // For HTML
import PaletteIcon from "@mui/icons-material/Palette"; // For CSS
import JsIcon from "@mui/icons-material/Javascript"; // For JavaScript (or custom JS icon)

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: theme.shape.borderRadius,
  border: "1px solid #e0e0e0",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 16px",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    padding: "6px 12px",
  },
}));

const StyledTab = styled(Tab)(({ theme, selected }) => ({
  textTransform: "none",
  fontWeight: "bold",
  minWidth: 0,
  padding: "8px 16px",
  marginRight: "1px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  color: selected ? "#fff" : "#ccc",
  backgroundColor: selected ? "#1E1E1E" : "#2D2D2D",
  borderBottom: selected ? "2px solid #007ACC" : "none",
  transition: "background-color 0.2s, color 0.2s",
  "&:hover": {
    backgroundColor: "#333333",
    color: "#fff",
  },
  "&.Mui-selected": {
    backgroundColor: "#1E1E1E",
    color: "#fff",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "6px 12px",
    fontSize: "0.8rem",
  },
}));

const Description = React.memo(({ text }) => {
  return (
    <Typography
      variant="body1"
      component="div"
      className="mb-4 text-gray-700 whitespace-pre-wrap text-sm sm:text-base"
    >
      {text.split("\n").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </Typography>
  );
});

const ActivityHeader = React.memo(
  ({ activity, activitySubmission, timer, formattedTime }) => {
    return (
      <StyledPaper elevation={3} className="bg-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            className="mb-2 font-bold text-gray-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
          >
            {activity.title}
          </Typography>
          {activitySubmission.timeTaken > 0 && (
            <Typography
              variant="subtitle1"
              className="mb-4 text-green-600 font-semibold text-sm sm:text-base"
            >
              {activitySubmission.pointsEarned} Points Earned
            </Typography>
          )}
          <Box className="mb-6 p-2 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Typography
              variant="h6"
              className="mb-2 font-semibold text-gray-700 text-base sm:text-lg"
            >
              Problem Statement:
            </Typography>
            <Description text={activity.problemStatement} />
          </Box>
          <Box className="mb-4">
            <LinearProgress
              variant="determinate"
              value={(timer / 3600) * 100}
              className="rounded-full h-2"
            />
            <Typography
              variant="caption"
              className="mt-1 text-gray-500 text-xs sm:text-sm"
            >
              Time Elapsed: {formattedTime}
            </Typography>
          </Box>
        </motion.div>
      </StyledPaper>
    );
  }
);

const CodingActivity = ({
  activity,
  onRunCode,
  onSubmit,
  output,
  setOutput,
}) => {
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [tabValue, setTabValue] = useState("html");
  const [openDialog, setOpenDialog] = useState(false);
  const [checkCodeDialogOpen, setCheckCodeDialogOpen] = useState(false);
  const [submissionResultDialogOpen, setSubmissionResultDialogOpen] =
    useState(false);
  const [finalResult, setFinalResult] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [editorWidth, setEditorWidth] = useState(50);
  const { lessonId, activityId, courseId } = useParams();
  const userId = useSelector((state) => state.user.userDetails._id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const activitySubmission = useSelector((state) =>
    state.userActivitySubmission.activitySubmissions.courses
      .find((course) => course.courseId === courseId)
      .lessons.find((lesson) => lesson.lessonId === lessonId)
      .activities.find(
        (activityDetail) => activityDetail.activityId === activityId
      )
  );
  const userAnalytics = useSelector((state) =>
    state.userAnalytics.userAnalytics.coursesAnalytics
      .find((course) => {
        const courseIdValue =
          typeof course.courseId === "object" && course.courseId._id
            ? course.courseId._id
            : course.courseId;
        return courseIdValue === courseId;
      })
      ?.lessonsAnalytics.find((lesson) => {
        const lessonIdValue =
          typeof lesson.lessonId === "object" && lesson.lessonId._id
            ? lesson.lessonId._id
            : lesson.lessonId;
        return lessonIdValue === lessonId;
      })
      ?.activitiesAnalytics.find((activityDetail) => {
        const activityIdValue =
          typeof activityDetail.activityId === "object" &&
          activityDetail.activityId._id
            ? activityDetail.activityId._id
            : activityDetail.activityId;
        return activityIdValue === activityId;
      })
  );
  const tries = activitySubmission.tries;
  //timer
  const [timer, setTimer] = useState(() => {
    const savedTimer = localStorage.getItem(`timer_${activityId}`);
    return savedTimer ? parseInt(savedTimer, 10) : 0;
  });
  const [startTime, setStartTime] = useState(null);
  const resetTimer = useCallback(() => {
    setTimer(0);
    setStartTime(null);
    localStorage.removeItem(`timer_${activityId}`);
  }, [activityId]);
  const formatTime = useCallback((totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }, []);
  const formattedTime = formatTime(timer);
  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          localStorage.setItem(`timer_${activityId}`, newTimer.toString());
          return newTimer;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startTime, activityId]);

  const [updateUserProgress] = useUpdateUserProgressMutation();
  const [updateActivitySubmission] = useUpdateUserActivitySubmissionMutation();
  const [decrementTries] = useDecrementActivitySubmissionMutation();
  const [updateUserAnalyticsMutation] = useUpdateUserAnalyticsMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (activity && activity.codeEditor) {
      setHtmlCode(activity.codeEditor.html || "");
      setCssCode(activity.codeEditor.css || "");
      setJsCode(activity.codeEditor.js || "");
    }
    if (
      !activitySubmission.timeTaken &&
      (!userAnalytics || !userAnalytics.timeSpent)
    ) {
      setStartTime(true);
    }
  }, [activity, activitySubmission.timeTaken, userAnalytics]);

  //For Tab Editor Changing
  const handleEditorChange = useCallback((value, language) => {
    switch (language) {
      case "html":
        setHtmlCode(value);
        break;
      case "css":
        setCssCode(value);
        break;
      case "javascript":
        setJsCode(value);
        break;
      default:
        break;
    }
  }, []);

  //For Resizeable
  const handleResize = useCallback((e) => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newEditorWidth = (e.clientX / containerWidth) * 100;
      setEditorWidth(Math.max(20, Math.min(newEditorWidth, 80)));
    }
  }, []);
  useEffect(() => {
    const resizer = resizerRef.current;
    let isResizing = false;

    const onMouseDown = (e) => {
      isResizing = true;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (isResizing) {
        handleResize(e);
      }
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    if (resizer) {
      resizer.addEventListener("mousedown", onMouseDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener("mousedown", onMouseDown);
      }
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleResize]);

  const handleSubmitCode = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionResultDialogOpen(false);
    if (
      activitySubmission.timeTaken &&
      (userAnalytics || userAnalytics.timeSpent)
    ) {
      console.log("Cannot submit activity as you already submitted it");
      return;
    }

    try {
      let endpoint;
      if (activity.language === "HTML") {
        endpoint = `${BACKEND_URL}/submit/html`;
      } else if (activity.language === "CSS") {
        endpoint = `${BACKEND_URL}/submit/css`;
      } else if (activity.language === "JavaScriptWeb") {
        endpoint = `${BACKEND_URL}/submit/javascriptweb`;
      } else if (activity.language === "JavaScriptConsole") {
        endpoint = `${BACKEND_URL}/submit/javascriptconsole`;
      }

      const response = await axios.post(endpoint, {
        htmlCode,
        cssCode,
        jsCode,
        activity,
      });

      const result = response.data;
      const { maxPoints, passed, totalPoints, feedback, language } = result;
      const timeTaken = timer;

      setSubmissionResult({
        passed,
        maxPoints,
        totalPoints: Math.round(totalPoints),
        tries: activitySubmission.tries,
        timeTaken,
        feedback,
        language,
      });

      const updateActivityProgress = await updateUserProgress({
        userId,
        courseId,
        lessonId,
        activityId,
      }).unwrap();
      dispatch(updateCourseProgress(updateActivityProgress));

      const updateAnalyticsData = await updateUserAnalyticsMutation({
        userId,
        analyticsData: {
          coursesAnalytics: [
            {
              courseId,
              lessonsAnalytics: [
                {
                  lessonId,
                  activitiesAnalytics: [
                    {
                      activityId: activityId,
                      timeSpent: timeTaken,
                      pointsEarned: Math.round(totalPoints),
                    },
                  ],
                },
              ],
            },
          ],
        },
      }).unwrap();
      dispatch(updateUserAnalytics(updateAnalyticsData));

      updateActivitySubmissionUtil(
        dispatch,
        updateActivitySubmission,
        userId,
        activityId,
        htmlCode,
        cssCode,
        jsCode,
        passed,
        Math.round(totalPoints),
        timeTaken
      );

      setFinalResult(true);
      setHtmlCode("");
      setCssCode("");
      setJsCode("");
      setOutput("");
      setIsSubmitting(false);
      resetTimer();
    } catch (error) {
      console.error("Error submitting code:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activity,
    activitySubmission,
    courseId,
    cssCode,
    dispatch,
    htmlCode,
    jsCode,
    lessonId,
    timer,
    updateActivitySubmission,
    updateUserAnalyticsMutation,
    updateUserProgress,
    userAnalytics,
    userId,
    activityId,
    resetTimer,
  ]);

  const handleCheckCode = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let endpoint;
      if (activity.language === "HTML") {
        endpoint = `${BACKEND_URL}/submit/html`;
      } else if (activity.language === "CSS") {
        endpoint = `${BACKEND_URL}/submit/css`;
      } else if (activity.language === "JavaScriptWeb") {
        endpoint = `${BACKEND_URL}/submit/javascriptweb`;
      } else if (activity.language === "JavaScriptConsole") {
        endpoint = `${BACKEND_URL}/submit/javascriptconsole`;
      }

      const response = await axios.post(endpoint, {
        htmlCode,
        cssCode,
        jsCode,
        activity,
      });

      const result = response.data;
      const {
        passed,
        maxPoints,
        totalPoints,
        expectedOutput,
        userOutput,
        feedback,
        language,
      } = result;

      const decrementData = await decrementTries({
        userId,
        activityId,
      }).unwrap();
      dispatch(setDecrementTries({ courseId, lessonId, activityId }));

      setSubmissionResultDialogOpen(true);
      setSubmissionResult({
        passed,
        maxPoints,
        totalPoints: Math.round(totalPoints),
        tries,
        error: result?.error,
        expectedOutput,
        userOutput,
        feedback,
        language,
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error checking code:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activity,
    activityId,
    courseId,
    cssCode,
    decrementTries,
    dispatch,
    htmlCode,
    jsCode,
    lessonId,
    tries,
    userId,
  ]);

  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);
  const handleCloseDialog = useCallback(
    (confirm) => {
      setOpenDialog(false);
      if (confirm) handleSubmitCode();
    },
    [handleSubmitCode]
  );

  const handleOpenCheckCodeDialog = useCallback(
    () => setCheckCodeDialogOpen(true),
    []
  );
  const handleCloseCheckCodeDialog = useCallback(
    (confirm) => {
      setCheckCodeDialogOpen(false);
      if (confirm) handleCheckCode();
    },
    [handleCheckCode]
  );

  const handleCloseSubmissionResultDialog = useCallback(
    () => setSubmissionResultDialogOpen(false),
    []
  );
  const handleFinalResultClose = useCallback(() => {
    setFinalResult(false);
    setSubmissionResultDialogOpen(false);
  }, []);

  const handleRunCode = useCallback(() => {
    if (onRunCode) {
      const result = onRunCode(
        !activitySubmission.html ? htmlCode : activitySubmission.html,
        !activitySubmission.css ? cssCode : activitySubmission.css,
        !activitySubmission.js ? jsCode : activitySubmission.js
      );
    }
  }, [
    activitySubmission.css,
    activitySubmission.html,
    activitySubmission.js,
    cssCode,
    htmlCode,
    jsCode,
    onRunCode,
  ]);

  const activities = useSelector(
    (state) =>
      state.userActivitySubmission.activitySubmissions.courses
        .find((course) => course.courseId === courseId)
        .lessons.find((lesson) => lesson.lessonId === lessonId).activities
  );
  const lessons = useSelector(
    (state) =>
      state.userActivitySubmission.activitySubmissions.courses.find(
        (course) => course.courseId === courseId
      ).lessons
  );
  const courses = useSelector(
    (state) => state.userActivitySubmission.activitySubmissions.courses
  );

  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, [activityId, resetTimer]);

  const handleNextActivity = useCallback(() => {
    resetTimer();
    const currentActivityIndex = activities.findIndex(
      (activityDetail) => activityDetail.activityId === activityId
    );

    if (currentActivityIndex < activities.length - 1) {
      const nextActivity = activities[currentActivityIndex + 1];
      navigate(
        `/course/${courseId}/lesson/${lessonId}/activity/${nextActivity.activityId}`
      );
      setFinalResult(false);
      setSubmissionResultDialogOpen(false);
    } else {
      const currentLessonIndex = lessons.findIndex(
        (lesson) => lesson.lessonId === lessonId
      );

      if (currentLessonIndex < lessons.length - 1) {
        const nextLessonId = lessons[currentLessonIndex + 1].lessonId;
        const nextActivityId =
          lessons[currentLessonIndex + 1].activities[0].activityId;
        navigate(`/course/${courseId}/lesson/${nextLessonId}`);
        setFinalResult(false);
        setSubmissionResultDialogOpen(false);
      } else {
        const currentCourseIndex = courses.findIndex(
          (course) => course.courseId === courseId
        );

        if (currentCourseIndex < courses.length - 1) {
          const nextCourseId = courses[currentCourseIndex + 1].courseId;
          const firstLessonId =
            courses[currentCourseIndex + 1].lessons[0].lessonId;
          const firstActivityId =
            courses[currentCourseIndex + 1].lessons[0].activities[0]
              ?.activityId;
          navigate(`/course/${nextCourseId}/lesson/${firstLessonId}`);
          setFinalResult(false);
          setSubmissionResultDialogOpen(false);
        } else {
          console.log("You have completed all courses!");
        }
      }
    }
  }, [
    activities,
    activityId,
    courseId,
    courses,
    lessonId,
    lessons,
    navigate,
    resetTimer,
  ]);

  if (!activity) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={{ flexGrow: 1, padding: "10px", overflow: "auto" }}
      className="min-h-screen"
    >
      <ActivityHeader
        activity={activity}
        activitySubmission={activitySubmission}
        timer={timer}
        formattedTime={formattedTime}
      />
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          height: isMobile ? "auto" : "calc(100vh - 300px)",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          ref={editorRef}
          sx={{
            width: isMobile ? "100%" : `${editorWidth}%`,
            height: isMobile ? "50vh" : "100%",
            overflow: "hidden",
            borderRight: isMobile ? "none" : "1px solid #e0e0e0",
            borderBottom: isMobile ? "1px solid #e0e0e0" : "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ backgroundColor: "#2D2D2D", padding: "4px 0" }}>
            <Tabs
              value={tabValue}
              onChange={(event, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <StyledTab
                label={isMobile ? "" : "HTML"}
                icon={<CodeIcon />}
                value="html"
                selected={tabValue === "html"}
              />
              <StyledTab
                label={isMobile ? "" : "CSS"}
                icon={<PaletteIcon />}
                value="css"
                selected={tabValue === "css"}
              />
              <StyledTab
                label={isMobile ? "" : "JS"}
                icon={<JsIcon />}
                value="javascript"
                selected={tabValue === "javascript"}
              />
            </Tabs>
          </Box>
          <Editor
            height={isMobile ? "100%" : "calc(100% - 48px)"}
            language={tabValue}
            value={
              tabValue === "html"
                ? !activitySubmission.html
                  ? htmlCode
                  : activitySubmission.html
                : tabValue === "css"
                ? !activitySubmission.css
                  ? cssCode
                  : activitySubmission.css
                : !activitySubmission.js
                ? jsCode
                : activitySubmission.js
            }
            onChange={(value) => handleEditorChange(value, tabValue)}
            options={{
              selectOnLineNumbers: true,
              readOnly:
                activitySubmission?.timeTaken &&
                (userAnalytics || userAnalytics?.timeSpent),
              theme: "vs-dark",
              minimap: { enabled: !isMobile },
              fontSize: isMobile ? 14 : 16,
            }}
          />
        </Box>
        {!isMobile && (
          <Box
            ref={resizerRef}
            sx={{
              width: "5px",
              background: "#4f46e5",
              cursor: "col-resize",
              transition: "background 0.3s",
              "&:hover": {
                background: "#6366f1",
              },
            }}
          />
        )}
        <Box
          ref={outputRef}
          sx={{
            flexGrow: 1,
            height: isMobile ? "50vh" : "100%",
            overflow: "auto",
            backgroundColor: "#f9fafb",
          }}
        >
          <OutputPanel output={output} activity={activity} />
        </Box>
      </Box>

      <Box className="mt-6 flex flex-wrap justify-between">
        <div className="flex flex-wrap mb-2 sm:mb-0">
          <StyledButton
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunCode}
            sx={{
              backgroundColor: "#10b981",
              "&:hover": {
                backgroundColor: "#059669",
              },
              color: "white",
              marginBottom: isMobile ? "8px" : "0",
            }}
          >
            Run Code
          </StyledButton>
          <StyledButton
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={
              activitySubmission?.tries > 0 ? handleOpenCheckCodeDialog : null
            }
            disabled={
              activitySubmission?.tries === 0 ||
              (activitySubmission?.timeTaken &&
                (userAnalytics || userAnalytics?.timeSpent)) ||
              isSubmitting
            }
            sx={{
              backgroundColor:
                activitySubmission?.tries > 0 ? "#6366f1" : "#9ca3af",
              "&:hover": {
                backgroundColor:
                  activitySubmission?.tries > 0 ? "#4f46e5" : "#9ca3af",
              },
              color: "white",
              marginBottom: isMobile ? "8px" : "0",
            }}
          >
            Check Code
          </StyledButton>
        </div>
        <StyledButton
          variant="contained"
          startIcon={<SendIcon />}
          onClick={
            activitySubmission.timeTaken &&
            (userAnalytics || userAnalytics?.timeSpent)
              ? null
              : handleOpenDialog
          }
          disabled={
            (activitySubmission?.timeTaken &&
              (userAnalytics || userAnalytics?.timeSpent)) ||
            isSubmitting
          }
          sx={{
            backgroundColor: "#8b5cf6",
            "&:hover": {
              backgroundColor: "#7c3aed",
            },
            color: "white",
          }}
        >
          Submit
        </StyledButton>
      </Box>

      {/* SUBMISSION CODE CONFIRMATION DIALOG */}
      <Dialog open={openDialog} onClose={() => handleCloseDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your code? You will not be able to
            change it after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={() => handleCloseDialog(true)} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* CHECK CODE CONFIRMATION DIALOG */}
      <Dialog
        open={checkCodeDialogOpen}
        onClose={() => handleCloseCheckCodeDialog(false)}
      >
        <DialogTitle>Confirm Code Check</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to check your code? This will evaluate your
            current submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleCloseCheckCodeDialog(false)}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => handleCloseCheckCodeDialog(true)}
            color="primary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* CHECK CODE  */}
      <Dialog
        open={submissionResultDialogOpen}
        onClose={handleCloseSubmissionResultDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Check Code Result
          <IconButton
            aria-label="close"
            onClick={handleCloseSubmissionResultDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" className="mb-2">
            {submissionResult?.passed
              ? "Your Score Passed"
              : "Kindly Double check your code"}
          </Typography>
          {submissionResult?.error && (
            <Typography color="error" className="mb-2">
              Error: {submissionResult.error}
            </Typography>
          )}
          <Typography className="mb-2">
            Score:{" "}
            {submissionResult?.totalPoints >= 0
              ? `${submissionResult.totalPoints}/${submissionResult?.maxPoints}`
              : submissionResult?.error && 0}
          </Typography>
          <Typography className="mb-4">
            Lives: {submissionResult?.tries - 1}
          </Typography>
          {submissionResult?.expectedOutput && (
            <Box className="mb-4">
              <Typography variant="h6" className="mb-2">
                Expected Output:
              </Typography>
              {submissionResult.language === "javascriptweb" ? (
                <iframe
                  title="Expected Output"
                  className="w-full h-64 border border-gray-300 rounded"
                  srcDoc={submissionResult.expectedOutput}
                />
              ) : (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {submissionResult.expectedOutput}
                </pre>
              )}
            </Box>
          )}
          {submissionResult?.userOutput && (
            <Box className="mb-4">
              <Typography variant="h6" className="mb-2">
                User Output:
              </Typography>
              {submissionResult.language === "javascriptweb" ? (
                <iframe
                  title="User Output"
                  className="w-full h-64 border border-gray-300 rounded"
                  srcDoc={submissionResult.userOutput}
                />
              ) : (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {submissionResult.userOutput}
                </pre>
              )}
            </Box>
          )}
          {submissionResult?.feedback && (
            <Box className="mt-4">
              <Typography variant="h6" className="mb-2">
                Test Cases:
              </Typography>
              {submissionResult.feedback.map((testCase, index) => (
                <Tooltip key={index} title={testCase.sentence}>
                  <Card
                    className="mb-2"
                    style={{
                      backgroundColor:
                        testCase.status === "correct" ? "#d0f8ce" : "#ffd0d0",
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2">
                        Test Case {index + 1}:{" "}
                        {testCase.status === "correct" ? "Passed" : "Failed"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmissionResultDialog} color="primary">
            Back
          </Button>
          <Button
            onClick={() => {
              handleSubmitCode();
              handleCloseSubmissionResultDialog();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUBMISSION RESULT */}
      <Dialog
        open={finalResult}
        onClose={handleFinalResultClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: submissionResult?.passed ? "#d0f8ce" : "#ffd0d0",
          },
        }}
      >
        <DialogTitle>
          {submissionResult?.passed
            ? "Congratulations! You passed!"
            : "Submission Result"}
          <IconButton
            aria-label="close"
            onClick={handleFinalResultClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" className="mb-4">
            {submissionResult?.passed
              ? "Your submission passed the test cases."
              : "Your submission did not pass the test cases."}
          </Typography>
          <Typography className="mb-2">
            Score: {submissionResult?.totalPoints} /{" "}
            {submissionResult?.maxPoints}
          </Typography>
          <Typography className="mb-4">
            Tries Remaining: {submissionResult?.tries}
          </Typography>
          {submissionResult?.feedback && (
            <Box className="mt-4">
              <Typography variant="h6" className="mb-2">
                Test Cases:
              </Typography>
              {submissionResult.feedback.map((testCase, index) => (
                <Tooltip
                  key={index}
                  title={<Typography>{testCase.sentence}</Typography>}
                >
                  <Card
                    className="mb-2"
                    style={{
                      backgroundColor:
                        testCase.status === "correct" ? "#d0f8ce" : "#ffd0d0",
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2">
                        Test Case {index + 1}:{" "}
                        {testCase.status === "correct" ? "Passed" : "Failed"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              navigate(
                `/course/${courseId}/lesson/${lessonId}/activity/activityList`
              )
            }
            color="primary"
          >
            Back to List
          </Button>
          <Button onClick={handleFinalResultClose} color="primary">
            Review Code
          </Button>
          <Button
            onClick={handleNextActivity}
            color="primary"
            endIcon={<ArrowForwardIcon />}
          >
            Next Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(CodingActivity);
