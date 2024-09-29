import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Editor } from "@monaco-editor/react";
import { Box, Tabs, Tab, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { setFileContent, removeFile } from "./sandboxSlice";

const PlaygroundCompiler = ({
  runCode,
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
  setDrawerOpen,
  drawerOpen
}) => {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.sandboxFiles.files);
  const theme = useTheme();

  useEffect(() => {
    if (activeFile) {
      const { name } = activeFile;
      const file = files.find((f) => f.name === name);
      if (file) {
        setFileContent({ fileName: name, content: file.content });
      }
    }
  }, [activeFile, files, dispatch]);

  useEffect(() => {
    if (runCode) {
      const iframe = document.getElementById("output");

      let htmlCode = files.find((file) => file.name.endsWith(".html"))?.content || "";
      const cssCode = files.find((file) => file.name.endsWith(".css"))?.content || "";
      const jsCode = files.find((file) => file.name.endsWith(".js"))?.content || "";

      const blobUrlMap = files.reduce((map, file) => {
        if (file.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
          map[file.name] = file.content;
        }
        return map;
      }, {});

      let processedHtmlCode = htmlCode;
      Object.keys(blobUrlMap).forEach((fileName) => {
        processedHtmlCode = processedHtmlCode.replace(
          new RegExp(fileName, "g"),
          blobUrlMap[fileName]
        );
      });

      const iframeContent = `
        <html>
          <head>
            <style>${cssCode}</style>
          </head>
          <body>
            ${processedHtmlCode}
            <script>${jsCode}<\/script>
          </body>
        </html>`;
      iframe.srcdoc = iframeContent;
    }
  }, [runCode, files]);

  const handleTabChange = (event, newValue) => {
    const selectedTab = openTabs.find((tab) => tab.name === newValue);
    if (selectedTab) {
      setActiveFile(selectedTab);
    }
  };

  const closeTab = (fileName) => {
    setOpenTabs((prevTabs) => prevTabs.filter((tab) => tab.name !== fileName));
    if (activeFile && activeFile.name === fileName) {
      setActiveFile(openTabs[0] || null);
    }
  };

  const handleEditorChange = (value) => {
    if (!activeFile) return;
    const fileName = activeFile.name;
    dispatch(setFileContent({ fileName, content: value }));
  };

  const renderEditorContent = () => {
    if (!activeFile) return null;

    const { name } = activeFile;
    const language = name.endsWith(".html")
      ? "html"
      : name.endsWith(".css")
      ? "css"
      : name.endsWith(".js")
      ? "javascript"
      : "plaintext";
    const value = files.find((file) => file.name === name)?.content || "";

    if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            bgcolor: theme.palette.background.default,
          }}
        >
          <img
            src={value}
            alt={name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      );
    }

    return (
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme.palette.mode === 'light' ? "vs-light" : "vs-dark"}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          autoClosingBrackets: "always",
          suggestOnTriggerCharacters: true,
          minimap: { enabled: false },
          fontSize: 16,
          quickSuggestions: true,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
        <Tabs
          value={activeFile ? activeFile.name : false}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          {openTabs.map((file) => (
            <Tab
              key={file.name}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {file.name}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(file.name);
                    }}
                    sx={{ color: theme.palette.text.primary, ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              value={file.name}
              sx={{ color: theme.palette.text.primary, minWidth: 0 }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: theme.palette.background.default, overflow: "hidden" }}>
          {renderEditorContent()}
        </Box>
        <Box sx={{ flex: 1, bgcolor: theme.palette.background.paper, position: "relative" }}>
          <iframe
            id="output"
            title="Output"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PlaygroundCompiler;