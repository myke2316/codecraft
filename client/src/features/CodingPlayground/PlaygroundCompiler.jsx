import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Editor } from "@monaco-editor/react";
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { setFileContent, removeFile } from "./sandboxSlice"; // Adjust the import path as needed

const PlaygroundCompiler = ({
  runCode,
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
}) => {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.sandboxFiles.files);

  useEffect(() => {
    if (activeFile) {
      // Ensure the activeFile content is set
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
      // const htmlCode =
      //   files.find((file) => file.name === "index.html")?.content || "";
      // const cssCode =
      //   files.find((file) => file.name === "styles.css")?.content || "";
      // const jsCode =
      //   files.find((file) => file.name === "script.js")?.content || "";

      // Create a mapping of file names to Blob URLs for images
      const blobUrlMap = files.reduce((map, file) => {
        if (file.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
          map[file.name] = file.content; // file.content is the Blob URL
        }
        return map;
      }, {});

      // Replace image filenames in HTML with Blob URLs
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
    if (openTabs.length > 1) {
      // Update openTabs to remove the selected tab
      setOpenTabs(openTabs.filter((tab) => tab.name !== fileName));

      // If the active file is being closed, set a new active file
      if (activeFile.name === fileName) {
        const newActiveFile = openTabs.find((tab) => tab.name !== fileName);
        setActiveFile(newActiveFile || null);
      }
    }
  };

  const handleEditorChange = (value) => {
    if (!activeFile) return;
    const fileName = activeFile.name;
    dispatch(setFileContent({ fileName, content: value }));
  };

  const renderEditorContent = () => {
    if (!activeFile) {
      return null; // Don't render the editor if no active file
    }

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
        width="100%"
        language={language}
        value={value}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          autoClosingBrackets: "always",
          suggestOnTriggerCharacters: true,
          minimap: { enabled: false },
          fontSize: 16,
          quickSuggestions: true,
        }}
      />
    );
  };

  useEffect(() => {
    // Synchronize openTabs with the files in the Redux store
    const validTabs = openTabs.filter((tab) =>
      files.some((file) => file.name === tab.name)
    );
    if (JSON.stringify(validTabs) !== JSON.stringify(openTabs)) {
      // If openTabs differs from validTabs, update openTabs
      setOpenTabs(validTabs);
    }
  }, [files, openTabs, setOpenTabs]);

  return (
    <Box className="flex flex-col h-full">
      {/* Tabs */}
      <Box className="bg-gray-800 text-white">
        <Box className="flex items-center">
          <Tabs
            value={activeFile ? activeFile.name : false}
            onChange={handleTabChange}
            sx={{ flexGrow: 1 }}
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
                      sx={{ color: "white", ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                value={file.name}
                sx={{ color: "white", minWidth: 0 }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Editor and Output */}
      <Box className="flex-1 flex">
        <Box className="flex-1 p-2 bg-gray-900">{renderEditorContent()}</Box>
        <Box className="flex-1 bg-white">
          <iframe
            id="output"
            className="w-full h-full border-none"
            title="Output"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PlaygroundCompiler;
