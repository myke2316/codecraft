import { Box, Grid, Typography } from "@mui/material";
import PlaygroundSidebar from "./PlaygroundSidebar";
import PlaygroundCompiler from "./PlaygroundCompiler";
import { useState } from "react";

function PlaygroundLayout() {
  //necessary for running the code:
  const [runCode, setRunCode] = useState(false);
  const handleRunCode = () => {
    setRunCode(true); // Trigger the code run

    // After the code runs, reset `runCode` back to `false`
    setTimeout(() => {
      setRunCode(false); // Ensures that subsequent runs are triggered only when the button is clicked again
    }, 0);
  };

  //for file click
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const handleFileClick = (file) => {
    // Add file to openTabs if not already present
    if (!openTabs.includes(file)) {
      setOpenTabs((prevTabs) => [...prevTabs, file]);
    }
    setActiveFile(file);
  };

  const [images, setImages] = useState([]);


  async function handleSave() {}
  
  return (
    <Box sx={{ height: "calc(100vh - 64px - 64px)" }}>
      {" "}
      {/* Adjust height as per navbar and footer height */}
      <Grid container sx={{ height: "100%" }}>
        {/* Sidebar */}
        <Grid item xs={2}>
          <PlaygroundSidebar
            handleRunCode={handleRunCode}
            handleFileClick={handleFileClick}
            images={images}
            setImages={setImages}
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
