import { Box, ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import PlaygroundSidebar from "./PlaygroundSidebar";
import PlaygroundCompiler from "./PlaygroundCompiler";
import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";

function PlaygroundLayout() {
  const [runCode, setRunCode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [mode, setMode] = useState('dark');
  const files = useSelector((state) => state.sandboxFiles.files);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: { main: '#1976d2' },
                background: { default: '#f5f5f5', paper: '#ffffff' },
                text: { primary: '#333333', secondary: '#555555' },
              }
            : {
                // Dark mode palette
                primary: { main: '#90caf9' },
                background: { default: '#1e1e1e', paper: '#2d2d2d' },
                text: { primary: '#ffffff', secondary: '#b0b0b0' },
              }),
        },
        typography: {
          fontFamily: 'Poppins, Arial, sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            `,
          },
        },
      }),
    [mode],
  );
  useEffect(() => {
    setOpenTabs((prevTabs) => {
      const updatedTabs = prevTabs.filter((tab) =>
        files.some((file) => file.name === tab.name)
      );
      return updatedTabs;
    });

    // Update activeFile if it was deleted
    if (activeFile && !files.some((file) => file.name === activeFile.name)) {
      setActiveFile(null);
    }
  }, [files]);

  const handleRunCode = () => {
    setRunCode(true);
    setTimeout(() => {
      setRunCode(false);
    }, 0);
  };

  const handleFileClick = (file) => {
    const fileExists = openTabs.some((tab) => tab.name === file.name);
    if (!fileExists) {
      setOpenTabs((prevTabs) => [...prevTabs, file]);
    }
    setActiveFile(file);
  };

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Box
          sx={{
            width: drawerOpen ? "240px" : "0",
            transition: "width 0.3s ease",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <PlaygroundSidebar
            handleRunCode={handleRunCode}
            handleFileClick={handleFileClick}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            toggleTheme={toggleTheme}
            mode={mode}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            transition: "all 0.3s ease",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PlaygroundCompiler
            runCode={runCode}
            activeFile={activeFile}
            openTabs={openTabs}
            setOpenTabs={setOpenTabs}
            setActiveFile={setActiveFile}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default PlaygroundLayout;