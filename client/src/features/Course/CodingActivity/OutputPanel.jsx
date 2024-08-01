import React from "react";
import { Paper, Typography } from "@mui/material";

const OutputPanel = ({ output, activity }) => {
  const language = activity.language;
  console.log(language)
  return (
    <div style={{ width: "300px", padding: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h6">Output</Typography>
        {language != "JavaScriptConsole" ? (
          <iframe
            title="Output"
            style={{ width: "100%", height: "100%", border: "none" }}
            srcDoc={output} // Use srcDoc to directly set the HTML content
          />
        ) : (
          <pre
            style={{
              width: "100%",
              height: "100%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "auto",
            }}
          >
            {output}
          </pre>
        )}
      </Paper>
    </div>
  );
};

export default OutputPanel;
