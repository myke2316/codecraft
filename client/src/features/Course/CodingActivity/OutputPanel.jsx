import React from "react";
import { Box,Paper, Typography } from "@mui/material";

const OutputPanel = ({ output, activity }) => {
  const language = activity.language;
  console.log(language)
  return (
    <Box sx={{ width: { xs: "100%", sm: "300px" }, padding: "20px" }}>
      <Paper elevation={3} sx={{ padding: "20px", height: "100%", display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>Output</Typography>
        {language !== "JavaScriptConsole" ? (
          <iframe
            title="Output"
            style={{ width: "100%", height: "100%", border: "none", flexGrow: 1 }}
            srcDoc={output}
          />
        ) : (
          <pre
            style={{
              width: "100%",
              height: "100%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "auto",
              flexGrow: 1,
            }}
          >
            {output}
          </pre>
        )}
      </Paper>
    </Box>
  );
};

export default OutputPanel;
