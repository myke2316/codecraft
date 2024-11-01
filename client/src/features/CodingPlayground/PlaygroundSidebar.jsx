import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Typography,
  TextField,
  Collapse,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { FaFileImport, FaFileExport, FaPlus } from "react-icons/fa";
import {
  Save,
  ExpandLess,
  ExpandMore,
  PlayArrow,
  Delete,
  ArrowBackIos,
  ArrowForwardIos,
  Home,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { addFile, removeFile } from "./sandboxSlice";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const drawerVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: "-240px", opacity: 0 },
};

const PlaygroundSidebar = ({
  handleRunCode,
  handleFileClick,
  setDrawerOpen,
  drawerOpen,
  toggleTheme,
  mode,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const userInfo = useSelector((state) => state.user.userDetails);
  const dispatch = useDispatch();
  const files = useSelector((state) => state.sandboxFiles.files);
  const [open, setOpen] = useState(true);
  const username = userInfo.username || userInfo.name;
  const navigate = useNavigate();
  const classData = useSelector((state) => state.class.class);

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && files.length === 0) {
      createInitialFiles();
      setHasInitialized(true);
    }
  }, [hasInitialized, files]);

  const createInitialFiles = () => {
    const initialFiles = [
      {
        name: 'index.html',
        content: `<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
      <h1 class="title">Hello World! </h1>
      <p id="currentTime"></p>
      <script src="script.js"></script>
  </body>
</html>`
      },
      {
        name: 'styles.css',
        content: `body{
  padding: 25px;
}
.title {
  color: #5C6AC4;
}`
      },
      {
        name: 'script.js',
        content: `function showTime() {
  document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
  showTime();
}, 1000);`
      }
    ];

    initialFiles.forEach(file => {
      dispatch(addFile({
        name: file.name,
        extension: file.name.split('.').pop(),
        content: file.content,
      }));
    });
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const fileExtension = newFileName.split(".").pop();
    const validExtensions = ["html", "css", "js"];
    if (!validExtensions.includes(fileExtension)) {
      alert(
        "Invalid file extension. Please create a .html, .css, or .js file."
      );
      return;
    }

    let defaultContent = "";
    switch (fileExtension) {
      case "html":
        defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New HTML File</title>
</head>
<body>
    
</body>
</html>`;
        break;
      case "css":
        defaultContent = "/* New CSS File */";
        break;
      case "js":
        defaultContent = "// New JavaScript File";
        break;
      default:
        break;
    }

    dispatch(
      addFile({
        name: newFileName,
        extension: fileExtension,
        content: defaultContent,
      })
    );
    setNewFileName("");
    setShowInput(false);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();

      if (fileExtension === "zip") {
        try {
          const zip = await JSZip.loadAsync(file);
          zip.forEach(async (relativePath, zipEntry) => {
            if (!zipEntry.dir) {
              const zipEntryExtension = zipEntry.name
                .split(".")
                .pop()
                .toLowerCase();
              if (["html", "css", "js"].includes(zipEntryExtension)) {
                const content = await zipEntry.async("text");
                handleFileImport(zipEntry.name, content);
              } else if (
                ["png", "jpg", "jpeg", "gif"].includes(zipEntryExtension)
              ) {
                const blob = await zipEntry.async("blob");
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result;
                  handleFileImport(zipEntry.name, base64String);
                };
                reader.readAsDataURL(blob);
              }
            }
          });
        } catch (error) {
          console.error("Failed to extract ZIP file:", error);
          alert("Failed to import ZIP file.");
        }
      } else if (["html", "css", "js"].includes(fileExtension)) {
        const content = await file.text();
        handleFileImport(fileName, content);
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          handleFileImport(fileName, base64String);
        };
        reader.readAsDataURL(file);
      } else {
        alert(
          "Unsupported file type. Please upload .html, .css, .js files, or images."
        );
      }
    }

    setFileInputKey((prevKey) => prevKey + 1);
  };

  const handleFileImport = (fileName, content) => {
    const existingFile = files.find((file) => file.name === fileName);
    if (existingFile) {
      alert("File already exists. Please choose a different file.");
      return;
    }
    dispatch(addFile({ name: fileName, content }));
  };

  const handleExportFiles = async () => {
    if (!files.length) {
      alert("No files to export.");
      return;
    }

    const zip = new JSZip();
    for (const file of files) {
      if (file.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
        const base64Data = file.content.split(",")[1];
        zip.file(file.name, base64Data, { base64: true });
      } else {
        zip.file(file.name, file.content);
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `codecraft-${username}.zip`);
    } catch (error) {
      console.error("Failed to export files:", error);
    }
  };

  const handleRemoveFile = () => {
    const fileToDelete = files[fileToDeleteIndex];
    if (fileToDelete) {
      dispatch(removeFile({ fileName: fileToDelete.name }));
      setOpenConfirmDialog(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <motion.div
        variants={drawerVariants}
        initial="open"
        animate={drawerOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 60 }}
        style={{
          width: 240,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
          padding: "16px",
          zIndex: 1200,
          color: mode === "light" ? "#333333" : "#ecf0f1",
          boxShadow: "5px 0 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Home />}
              sx={{
                color: mode === "light" ? "#333333" : "#ecf0f1",
                borderColor: mode === "light" ? "#333333" : "#ecf0f1",
                "&:hover": {
                  backgroundColor: mode === "light" ? "#f0f0f0" : "#34495e",
                  borderColor: mode === "light" ? "#1976d2" : "#1abc9c",
                },
              }}
              onClick={() =>
                userInfo.role === "teacher"
                  ? navigate(-1)
                  : navigate(`/studentClass/${classData._id}/classHome`)
              }
            >
              Home
            </Button>
          </Box>
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              alignItems: "center",
              color: mode === "light" ? "#333333" : "#ecf0f1",
              fontWeight: "light",
            }}
          >
            <img
              src="/new.png"
              alt="Logo"
              style={{
                width: "25px",
                height: "25px",
                marginRight: "10px",
              }}
            />
            <span style={{ color: "#928fce" }}>&lt;</span>
            CodeCraft
            <span style={{ color: "#928fce" }}>/&gt;</span>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
          <Tooltip title="Create New File">
            <IconButton
              color="primary"
              onClick={() => setShowInput(true)}
              sx={{ color: mode === "light" ? "#1976d2" : "#1abc9c" }}
            >
              <FaPlus />
            </IconButton>
          </Tooltip>
          <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
            <Tooltip title="Import Files">
              <IconButton
                color="primary"
                component="span"
                sx={{ color: mode === "light" ? "#1976d2" : "#928fce" }}
              >
                <FaFileImport />
              </IconButton>
            </Tooltip>
          </label>
          <input
            accept=".html,.css,.js,.txt,.png,.jpg,.jpeg,.gif,.bmp,.svg,.zip"
            style={{ display: "none" }}
            id="file-upload"
            type="file"
            multiple
            key={fileInputKey}
            onChange={handleFileUpload}
          />
          <Tooltip title="Export Files">
            <IconButton
              color="primary"
              onClick={handleExportFiles}
              sx={{ color: mode === "light" ? "#1976d2" : "#e67e22" }}
            >
              <FaFileExport />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ bgcolor: mode === "light" ? "#e0e0e0" : "#95a5a6" }} />
        {showInput && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="File Name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name with extension"
              size="small"
              helperText=".html, .css, or .js only"
              sx={{
                bgcolor: mode === "light" ? "#f5f5f5" : "#34495e",
                color: mode === "light" ? "#333333" : "#ecf0f1",
                input: { color: mode === "light" ? "#333333" : "#ecf0f1" },
                label: { color: mode === "light" ? "#555555" : "#95a5a6" },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreateFile}
              sx={{ mt: 1 }}
            >
              Create File
            </Button>
          </Box>
        )}
        <List sx={{ flexGrow: 1 }}>
          <ListItemButton onClick={() => setOpen(!open)}>
            <ListItemText
              primary="Files"
              sx={{ color: mode === "light" ? "#333333" : "#ecf0f1" }}
            />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {files.map((file, index) => (
                <ListItemButton
                  sx={{
                    pl: 4,
                    bgcolor:
                      index === fileToDeleteIndex
                        ? mode === "light"
                          ? "#e0e0e0"
                          : "#34495e"
                        : "transparent",
                  }}
                  key={index}
                  onClick={() => handleFileClick(file)}
                >
                  <ListItemText
                    primary={file.name}
                    sx={{ color: mode === "light" ? "#333333" : "#ecf0f1" }}
                  />
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToDeleteIndex(index);
                      setOpenConfirmDialog(true);
                    }}
                  >
                    <Delete
                      sx={{ color: mode === "light" ? "#d32f2f" : "#e74c3c" }}
                    />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
        <Divider
          sx={{ 
            bgcolor: mode === "light" ? "#e0e0e0" : "#95a5a6",
            my: 2,
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            sx={{
              bgcolor: mode === "light" ? "#1976d2" : "#6e61ab",
              color: mode === "light" ? "#ffffff" : "#ecf0f1",
            }}
            onClick={handleExportFiles}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            sx={{
              color: mode === "light" ? "#1976d2" : "#aab1e5",
              borderColor: mode === "light" ? "#1976d2" : "#aab1e5",
            }}
            onClick={handleRunCode}
          >
            Run Code
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === "dark"}
                onChange={toggleTheme}
                icon={<Brightness7 />}
                checkedIcon={<Brightness4 />}
              />
            }
            label={mode === "dark" ? "Dark Mode" : "Light Mode"}
          />
        </Box>
      </motion.div>
      <IconButton
        onClick={() => setDrawerOpen(!drawerOpen)}
        sx={{
          position: "fixed",
          top: "50%",
          left: drawerOpen ? 240 : 0,
          zIndex: 1300,
          transform: "translateY(-50%)",
          color: mode === "light" ? "#333333" : "#ecf0f1",
          backgroundColor: mode === "light" ? "#f0f0f0" : "#3f0081",
          "&:hover": {
            backgroundColor: mode === "light" ? "#e0e0e0" : "#aab1e5",
          },
        }}
      >
        {drawerOpen ? <ArrowBackIos /> : <ArrowForwardIos />}
      </IconButton>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this file?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveFile}
            sx={{ color: mode === "light" ? "#d32f2f" : "#e74c3c" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaygroundSidebar;