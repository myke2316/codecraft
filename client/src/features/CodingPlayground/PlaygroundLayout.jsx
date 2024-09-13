import { Box, Grid } from "@mui/material";
import PlaygroundSidebar from "./PlaygroundSidebar";
import PlaygroundCompiler from "./PlaygroundCompiler";
import { useState } from "react";

function PlaygroundLayout() {
  // State to control running the code
  const [runCode, setRunCode] = useState(false);
  const handleRunCode = () => {
    setRunCode(true); // Trigger the code run

    // Reset `runCode` after execution to allow subsequent runs
    setTimeout(() => {
      setRunCode(false);
    }, 0);
  };

  // State for handling file tabs
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  const handleFileClick = (file) => {
    // Check if a file with the same name already exists in openTabs
    const fileExists = openTabs.some((tab) => tab.name === file.name);
  
    // Add file to openTabs if it's not already present
    if (!fileExists) {
      setOpenTabs((prevTabs) => [...prevTabs, file]);
    }
  
    // Set the clicked file as the active file
    setActiveFile(file);
  };
  return (
    <Box sx={{ height: "calc(100vh - 64px - 64px)" }}>
      {/* Adjust height based on navbar and footer */}
      <Grid container sx={{ height: "100%" }}>
        {/* Sidebar */}
        <Grid item xs={2}>
          <PlaygroundSidebar
            handleRunCode={handleRunCode}
            handleFileClick={handleFileClick}
          />
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={10}>
          <PlaygroundCompiler
            runCode={runCode}
            activeFile={activeFile}
            openTabs={openTabs}
            setOpenTabs={setOpenTabs}
            setActiveFile={setActiveFile}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlaygroundLayout;
