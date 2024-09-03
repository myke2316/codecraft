import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/html";
import "ace-builds/src-noconflict/snippets/css";
import "ace-builds/src-noconflict/snippets/javascript";
const PlaygroundCompiler = ({
  runCode,
  openTabs,
  activeFile,
  setOpenTabs,
  setActiveFile,
}) => {
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  useEffect(() => {
    if (runCode) {
      const iframe = document.getElementById("output");
      const iframeContent = `
        <html>
          <head>
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
          </body>
        </html>`;
      iframe.srcdoc = iframeContent;
    }
  }, [runCode, htmlCode, cssCode, jsCode]);

  const handleTabChange = (event, newValue) => {
    setActiveFile(newValue);
  };

  const closeTab = (fileName) => {
    if (openTabs.length > 1) {
      setOpenTabs(openTabs.filter((tab) => tab !== fileName));
      if (activeFile === fileName) {
        const newActiveFile = openTabs[openTabs.length - 2];
        setActiveFile(newActiveFile);
      }
    }
  };

  const renderEditorContent = () => {
    if (!activeFile) {
      return null; // Don't render the editor if no active file
    }

    return renderEditor(
      activeFile,
      htmlCode,
      cssCode,
      jsCode,
      setHtmlCode,
      setCssCode,
      setJsCode
    );
  };

  return (
    <Box className="flex flex-col h-full">
      {/* Tabs */}
      <Box className="bg-gray-800 text-white">
        <Tabs value={activeFile} onChange={handleTabChange}>
          {openTabs.map((fileName) => (
            <Tab
              key={fileName}
              label={
                <Box className="flex items-center">
                  {fileName}
                  {openTabs.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(fileName);
                      }}
                      sx={{ ml: 1, color: "white" }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              value={fileName}
              sx={{ color: "white" }}
            />
          ))}
        </Tabs>
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

const renderEditor = (
  activeFile,
  htmlCode,
  cssCode,
  jsCode,
  setHtmlCode,
  setCssCode,
  setJsCode
) => {
  let language = "";
  let value = "";

  // Determine language and value based on file extension
  if (activeFile?.endsWith(".html")) {
    language = "html";
    value = htmlCode;
  } else if (activeFile?.endsWith(".css")) {
    language = "css";
    value = cssCode;
  } else if (activeFile?.endsWith(".js")) {
    language = "javascript";
    value = jsCode;
  } else {
    language = "plaintext"; // Default language for unknown file types
    value = "";
  }
  console.log(language);

  return (
    <Editor
      height="100%"
      width="100%"
      defaultLanguage={language}
      value={value}
      theme="vs-dark"
      onChange={(value) => {
        if (activeFile?.endsWith(".html")) setHtmlCode(value);
        if (activeFile?.endsWith(".css")) setCssCode(value);
        if (activeFile?.endsWith(".js")) setJsCode(value);
      }}
      options={{
        automaticLayout: true,
        autoClosingBrackets: "always",
        suggestOnTriggerCharacters: true,
        minimap: { enabled: false },
        fontSize: 16, quickSuggestions: true,
      }}
    />
  );
};

export default PlaygroundCompiler;
