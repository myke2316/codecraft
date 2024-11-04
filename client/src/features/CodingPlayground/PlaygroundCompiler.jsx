import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Editor } from "@monaco-editor/react";
import { Box, Tabs, Tab, IconButton, useTheme, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FaExternalLinkAlt } from "react-icons/fa";
import { setFileContent } from "./sandboxSlice";

const PlaygroundCompiler = ({
  runCode,
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
}) => {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.sandboxFiles.files);
  const theme = useTheme();
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const iframeRef = useRef(null);
  const [iframeContent, setIframeContent] = useState("");

  useEffect(() => {
    if (activeFile) {
      const { name } = activeFile;
      const file = files.find((f) => f.name === name);
      if (file) {
        dispatch(setFileContent({ fileName: name, content: file.content }));
      }
    }
  }, [activeFile, files, dispatch]);

  useEffect(() => {
    if (runCode) {
      const htmlFile = files.find((file) => file.name.endsWith(".html"));
      if (htmlFile) {
        let htmlContent = htmlFile.content;

        // Process CSS links
        const cssLinks =
          htmlContent.match(/<link.*?href=["'](.*?)["'].*?>/g) || [];
        cssLinks.forEach((link) => {
          const href = link.match(/href=["'](.*?)["']/)[1];
          const cssFile = files.find((file) => file.name === href);
          if (cssFile) {
            htmlContent = htmlContent.replace(
              link,
              `<style>${cssFile.content}</style>`
            );
          }
        });

        // Process JS scripts
        const jsScripts =
          htmlContent.match(/<script.*?src=["'](.*?)["'].*?><\/script>/g) || [];
        jsScripts.forEach((script) => {
          const src = script.match(/src=["'](.*?)["']/)[1];
          const jsFile = files.find((file) => file.name === src);
          if (jsFile) {
            htmlContent = htmlContent.replace(
              script,
              `<script>${jsFile.content}</script>`
            );
          }
        });

        // Process image sources
        const imgTags =
          htmlContent.match(/<img.*?src=["'](.*?)["'].*?>/g) || [];
        imgTags.forEach((img) => {
          const src = img.match(/src=["'](.*?)["']/)[1];
          const imageFile = files.find((file) => file.name === src);
          if (imageFile) {
            htmlContent = htmlContent.replace(src, imageFile.content);
          }
        });

        setIframeContent(htmlContent);
        if (iframeRef.current) {
          iframeRef.current.srcdoc = htmlContent;
        }
      }
    }
  }, [runCode, files]);

  const handleTabChange = (event, newValue) => {
    const selectedTab = openTabs.find((tab) => tab.name === newValue);
    if (selectedTab) {
      setActiveFile(selectedTab);
    }
  };
  const closeTab = (fileName) => {
    setOpenTabs((prevTabs) => {
      const updatedTabs = prevTabs.filter((tab) => tab.name !== fileName);

      if (updatedTabs.length === 0) {
        setActiveFile(null); // Set to null when no tabs remain
      } else if (activeFile && activeFile.name === fileName) {
        setActiveFile(updatedTabs[0]); // Set to the first tab in the updated list
      }

      return updatedTabs;
    });
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
        theme={theme.palette.mode === "light" ? "vs-light" : "vs-dark"}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          autoClosingBrackets: "always",
          suggestOnTriggerCharacters: true,
          minimap: { enabled: false },
          fontSize: 16,
          quickSuggestions: true,
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
          },
        }}
      />
    );
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = "none";
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftPaneWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setLeftPaneWidth(Math.min(Math.max(newLeftPaneWidth, 20), 80));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = "auto";
    }
  }, [handleMouseMove]);

  useEffect(() => {
    const resizer = resizerRef.current;
    resizer.addEventListener("mousedown", handleMouseDown);

    return () => {
      resizer.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseDown]);

  const openInNewTab = () => {
    const newWindow = window.open();
    newWindow.document.write(iframeContent);
    newWindow.document.close();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
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

      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: `${leftPaneWidth}%`,
            height: "100%",
            bgcolor: theme.palette.background.default,
            overflow: "hidden",
          }}
        >
          {renderEditorContent()}
        </Box>
        <Box
          ref={resizerRef}
          sx={{
            width: "10px",
            height: "100%",
            bgcolor: theme.palette.divider,
            cursor: "col-resize",
            "&:hover": {
              bgcolor: theme.palette.primary.main,
            },
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            width: `${100 - leftPaneWidth}%`,
            height: "100%",
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <iframe
            ref={iframeRef}
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
          <Tooltip title="Open in new tab" placement="top">
            <IconButton
              onClick={openInNewTab}
              sx={{
                position: "absolute",
                top: theme.spacing(1),
                right: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                zIndex: 2,
              }}
              aria-label="Open in new tab"
            >
              <FaExternalLinkAlt size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default PlaygroundCompiler;
