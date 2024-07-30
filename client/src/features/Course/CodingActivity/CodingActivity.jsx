

import React, { useState, useEffect } from "react";
import { Paper, Typography, Button, Box, Tabs, Tab } from "@mui/material";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

const CodingActivity = ({ activity, onRunCode, onSubmit }) => {
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [tabValue, setTabValue] = useState("html");
  const [submissionResult, setSubmissionResult] = useState(null);

  // Set initial code values when activity changes
  useEffect(() => {
    if (activity && activity.codeEditor) {
      setHtmlCode(activity.codeEditor.html || "");
      setCssCode(activity.codeEditor.css || "");
      setJsCode(activity.codeEditor.js || "");
    }
  }, [activity]);

  const handleEditorChange = (value) => {
    if (tabValue === "html") setHtmlCode(value);
    if (tabValue === "css") setCssCode(value);
    if (tabValue === "js") setJsCode(value);
  };

  const handleSubmitCode = async () => {
    try {
      let endpoint;
      if (activity.language === "HTML") {
        endpoint = "http://localhost:8000/submit/html";
      } else if (activity.language === "CSS") {
        endpoint = "http://localhost:8000/submit/css";
      } else if (activity.language === "JavaScriptWeb") {
        endpoint = "http://localhost:8000/submit/javascriptweb";
      }else if (activity.language === "JavaScriptConsole") {
        endpoint = "http://localhost:8000/submit/javascriptconsole";
      }

      const response = await axios.post(endpoint, {
        htmlCode,
        cssCode,
        jsCode,
        activityId: activity.activityId,
      });

      const result = response.data;
      setSubmissionResult(result);
      console.log(result)
      console.log(`You got ${result.totalPoints} out of ${result.maxPoints}`);

      if (result.passed) {
        console.log("Submission passed! Score: " + result.totalPoints);
      } else {
        console.log("Submission failed.");
      }

    } catch (error) {
      console.error("Error submitting code:", error);
    }
  };

  const handleRunCode = () => {
    if (onRunCode) onRunCode(htmlCode, cssCode, jsCode);
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(htmlCode, cssCode, jsCode);
  };

  if (!activity) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: "20px" }}>
      <Paper elevation={3} sx={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h5">{activity.title}</Typography>
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
              ? htmlCode
              : tabValue === "css"
              ? cssCode
              : jsCode
          }
          onChange={handleEditorChange}
          options={{ selectOnLineNumbers: true }}
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
          sx={{ marginTop: "10px" }}
          onClick={handleSubmitCode}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default CodingActivity;


