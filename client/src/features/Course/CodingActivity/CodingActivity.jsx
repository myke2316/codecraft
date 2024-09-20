import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";

import { Editor } from "@monaco-editor/react";
import axios from "axios";
import { useUpdateUserProgressMutation } from "../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../Student/studentCourseProgressSlice";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  useDecrementActivitySubmissionMutation,
  useUpdateUserActivitySubmissionMutation,
} from "./activitySubmissionService";
import { updateActivitySubmissionUtil } from "../../../utils/activitySubmissionUtil";
import { setDecrementTries } from "./activitySubmissionSlice";
import { useUpdateUserAnalyticsMutation } from "../../Student/userAnalyticsService";
import { updateUserAnalytics } from "../../Student/userAnalyticsSlice";
import { BACKEND_URL } from "../../../constants";

const CodingActivity = ({ activity, onRunCode, onSubmit }) => {
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
  const { lessonId, activityId, courseId } = useParams();
  const userId = useSelector((state) => state.user.userDetails._id);
  const dispatch = useDispatch();
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
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const resetTimer = () => {
    setTimer(0);
    setStartTime(null);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const formattedTime = formatTime(timer); // Create a formatted time variable

  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      console.log(timer);
      return () => clearInterval(intervalId);
    }
  }, [startTime, activitySubmission._id]);

  //mutations
  const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
    useUpdateUserProgressMutation();
  const [
    updateActivitySubmission,
    { isLoading: isLoadingUpdateActivitySubmission },
  ] = useUpdateUserActivitySubmissionMutation();
  const [decrementTries, { isLoading: isLoadingDecrementTries }] =
    useDecrementActivitySubmissionMutation();
  const [
    updateUserAnalyticsMutation,
    { isLoading: isLoadingUpdateUserAnalytics },
  ] = useUpdateUserAnalyticsMutation();
  // Set initial code values when activity changes
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
      setStartTime(true); // Start the timer if the activity hasn't been submitted
    }
  }, [activity]);
  const handleEditorChange = (value) => {
    if (tabValue === "html") setHtmlCode(value);
    if (tabValue === "css") setCssCode(value);
    if (tabValue === "js") setJsCode(value);
  };

  //submit code
  async function handleSubmitCode() {
    if (
      activitySubmission.timeTaken &&
      (userAnalytics || userAnalytics.timeSpent)
    ) {
      console.log("Cannot submit activity as you already submitted it");
    } else {
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
        console.log(result);
        const maxPoints = result.maxPoints;
        const passed = result.passed;
        const totalPoints = Math.round(result.totalPoints);
        const timeTaken = timer;
        const feedback = result.feedback;
        const language = result.language;
        setSubmissionResult({
          passed,
          maxPoints,
          totalPoints,
          tries: activitySubmission.tries,
          timeTaken,
          feedback,
          language,
        });
        console.log(result);
        console.log(`You got ${result.totalPoints} out of ${result.maxPoints}`);

        //update the courseprogress to unlock the next activity
        const updateActivityProgress = await updateUserProgress({
          userId,
          courseId,
          lessonId,
          activityId,
        }).unwrap();
        // console.log(updateActivityProgress);
        dispatch(updateCourseProgress(updateActivityProgress));

        //handle or update the userAnalytics
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
                        pointsEarned: totalPoints,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }).unwrap();
        dispatch(updateUserAnalytics(updateAnalyticsData));

        //handle or update the activitySubmission
        updateActivitySubmissionUtil(
          dispatch,
          updateActivitySubmission,
          userId,
          activityId,
          htmlCode,
          cssCode,
          jsCode,
          passed,
          totalPoints,
          timeTaken
        );

        setFinalResult(true);

        if (result.passed) {
          console.log(
            "Submission passed! Score: " + result.totalPoints + `/ ${maxPoints}`
          );
        } else {
          console.log(
            "Submission failed." + result.totalPoints + `/ ${maxPoints}`
          );
        }
      } catch (error) {
        console.error("Error submitting code:", error);
      } finally {
        console.log(timer);
        setStartTime(null); // Stop the timer
      }
    }
  }

  async function handleCheckCode() {
    console.log(BACKEND_URL);
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
      console.log(response);
      const result = response.data;
      const passed = result.passed;
      const maxPoints = result.maxPoints;
      const totalPoints = Math.round(result.totalPoints);
      const expectedOutput = result.expectedOutput;
      const userOutput = result.userOutput;
      const feedback = result.feedback;
      const language = result.language;
      const decrementData = await decrementTries({
        userId,
        activityId,
      }).unwrap();
      dispatch(setDecrementTries({ courseId, lessonId, activityId }));

      setSubmissionResultDialogOpen(true);
      setSubmissionResult({
        passed,
        maxPoints,
        totalPoints,
        tries,
        error: result?.error,
        expectedOutput,
        userOutput,
        feedback,
        language,
      });
    } catch (error) {
      console.log(error);
    }
  }

  //for popups
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = (confirm) => {
    setOpenDialog(false);
    if (confirm) {
      handleSubmitCode();
    }
  };

  const handleOpenCheckCodeDialog = () => {
    setCheckCodeDialogOpen(true);
  };

  const handleCloseCheckCodeDialog = (confirm) => {
    setCheckCodeDialogOpen(false);
    if (confirm) {
      handleCheckCode();
    }
  };

  const handleCloseSubmissionResultDialog = () => {
    setSubmissionResultDialogOpen(false);
  };

  const handleFinalResultClose = () => {
    setFinalResult(false);
    setSubmissionResultDialogOpen(false);
  };
  //for code running
  const handleRunCode = () => {
    if (onRunCode)
      onRunCode(
        !activitySubmission.html ? htmlCode : activitySubmission.html,
        !activitySubmission.css ? cssCode : activitySubmission.css,
        !activitySubmission.js ? jsCode : activitySubmission.js
      );
  };
  const navigate = useNavigate();
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
  }, [activityId]);

  const handleNextActivity = () => {
    resetTimer();
    const currentActivityIndex = activities.findIndex(
      (activityDetail) => activityDetail.activityId === activityId
    );

    // Check if there's a next activity in the current lesson
    if (currentActivityIndex < activities.length - 1) {
      const nextActivityId = activities[currentActivityIndex + 1].activityId;
      navigate(
        `/course/${courseId}/lesson/${lessonId}/activity/${nextActivityId}`
      );
      setFinalResult(false);
      setSubmissionResultDialogOpen(false);
    } else {
      // Check if there's a next lesson in the current course
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
        // Check if there's a next course
        const currentCourseIndex = courses.findIndex(
          (course) => course.courseId === courseId
        );

        if (currentCourseIndex < courses.length - 1) {
          const nextCourseId = courses[currentCourseIndex + 1].courseId;
          const firstLessonId =
            courses[currentCourseIndex + 1].lessons[0].lessonId;
          const firstActivityId =
            courses[currentCourseIndex + 1].lessons[0].activities[0].activityId;
          navigate(`/course/${nextCourseId}/lesson/${firstLessonId}`);
          setFinalResult(false);
          setSubmissionResultDialogOpen(false);
        } else {
          console.log("You have completed all courses!");
        }
      }
    }
  };

  if (!activity) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: "20px" }}>
      <Paper elevation={3} sx={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h5">
          {activity.title} -{" "}
          {activitySubmission.timeTaken > 0 &&
            `${activitySubmission.pointsEarned} Points Earned`}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: "10px" }}>
          {activity.problemStatement}
        </Typography>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          sx={{ marginBottom: "10px" }}
        >
          <Tab label="HTML" value="html" />
          <Tab label="CSS" value="css" />
          <Tab label="JavaScript" value="js" />
        </Tabs>
        <Editor
          height="400px"
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
          onChange={handleEditorChange}
          options={{
            selectOnLineNumbers: true,
            readOnly:
              activitySubmission?.timeTaken &&
              (userAnalytics || userAnalytics?.timeSpent),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: "10px", marginRight: "10px" }}
          onClick={handleRunCode}
        >
          Run Code
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: "10px",
            marginRight: "10px",
            backgroundColor: activitySubmission?.tries > 0 ? "primary" : "gray",
            color: activitySubmission?.tries > 0 ? "primary" : "white",
            "&:hover": {
              backgroundColor: activitySubmission?.tries > 0 ? "blue" : "gray",
            },
          }}
          disabled={
            activitySubmission?.tries === 0 ||
            (activitySubmission?.timeTaken &&
              (userAnalytics || userAnalytics?.timeSpent))
          }
          onClick={
            activitySubmission?.tries > 0 ? handleOpenCheckCodeDialog : null
          }
        >
          Check Code
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: "10px",
            marginRight: "10px",
          }}
          disabled={
            activitySubmission?.timeTaken &&
            (userAnalytics || userAnalytics?.timeSpent)
          }
          onClick={
            activitySubmission.timeTaken &&
            (userAnalytics || userAnalytics?.timeSpent)
              ? null
              : handleOpenDialog
          }
        >
          Submit
        </Button>
      </Paper>

      {/* Confirm Submission */}
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

      {/* Confirm Code Check */}
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

      {/* Check Code Result */}
      <Dialog
        open={submissionResultDialogOpen}
        onClose={handleCloseSubmissionResultDialog}
      >
        <DialogTitle>Check Code Result</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {submissionResult?.passed
              ? "Your Score Passed"
              : "Kindly Double check your code"}
            <br />
            {submissionResult?.error ? "Error: " : null}
            {submissionResult?.error && submissionResult.error}
            <br />
            Score:{" "}
            {submissionResult?.totalPoints >= 0
              ? `${submissionResult.totalPoints}/${submissionResult?.maxPoints}`
              : submissionResult?.error && 0}
            <br />
            Lives: {submissionResult?.tries - 1}
            <br />
            {submissionResult?.expectedOutput && (
              <>
                <br />
                <strong>Expected Output:</strong>
                {submissionResult.language === "javascriptweb" ? (
                  <iframe
                    title="Expected Output"
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "1px solid black",
                    }}
                    srcDoc={submissionResult.expectedOutput}
                  />
                ) : (
                  <pre style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
                    {submissionResult.expectedOutput}
                  </pre>
                )}
              </>
            )}
            {submissionResult?.userOutput && (
              <>
                <br />
                <strong>User Output:</strong>
                {submissionResult.language === "javascriptweb" ? (
                  <iframe
                    title="Expected Output"
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "1px solid black",
                    }}
                    srcDoc={submissionResult.userOutput}
                  />
                ) : (
                  <pre style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
                    {submissionResult.expectedOutput}
                  </pre>
                )}
              </>
            )}
          </DialogContentText>

          {submissionResult?.feedback && (
            <div className="mt-4">
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
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmissionResultDialog} color="primary">
            Back
          </Button>
          <Button onClick={handleSubmitCode} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={finalResult}
        onClose={handleFinalResultClose}
        aria-labelledby="submission-result-dialog-title"
        aria-describedby="submission-result-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: submissionResult?.passed ? "#d0f8ce" : "#ffd0d0",
          },
        }}
      >
        <DialogTitle id="submission-result-dialog-title">
          {submissionResult?.passed
            ? "Congratulations! You passed!"
            : "Submission Result"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="submission-result-dialog-description">
            {submissionResult?.passed
              ? "Your submission passed the test cases."
              : "Your submission did not pass the test cases."}
            <br />
            Score: {submissionResult?.totalPoints} /{" "}
            {submissionResult?.maxPoints}
            <br />
            Tries Remaining: {submissionResult?.tries}
          </DialogContentText>

          {submissionResult?.feedback && (
            <div className="mt-4">
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
            </div>
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
            Back
          </Button>
          <Button onClick={handleFinalResultClose} color="primary">
            Review Code
          </Button>
          <Button onClick={handleNextActivity} color="primary">
            Next Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodingActivity;
