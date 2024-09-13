import React, { useState } from "react";
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
} from "@mui/material";
import { FaFileImport, FaFileExport, FaPlus } from "react-icons/fa";
import { Save, ExpandLess, ExpandMore, PlayArrow } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { addFile, removeFile } from "./sandboxSlice";
import JSZip from "jszip"; // Ensure JSZip is imported
import { saveAs } from "file-saver";
const PlaygroundSidebar = ({ handleRunCode, handleFileClick }) => {
  const [newFileName, setNewFileName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const userInfo = useSelector((state) => state.user.userDetails);
  const dispatch = useDispatch();
  const files = useSelector((state) => state.sandboxFiles.files);

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
        defaultContent = "<!-- New HTML File -->";
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
                // For text-based files, read them as text
                const content = await zipEntry.async("text");
                handleFileImport(zipEntry.name, content);
              } else if (
                ["png", "jpg", "jpeg", "gif"].includes(zipEntryExtension)
              ) {
                // For image files, read them as base64
                const blob = await zipEntry.async("blob");
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result;
                  handleFileImport(zipEntry.name, base64String); // Store image as base64
                };
                reader.readAsDataURL(blob); // Convert blob to base64
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
          handleFileImport(fileName, base64String); // Store image as base64
        };
        reader.readAsDataURL(file); // Convert image to base64
      } else {
        alert(
          "Unsupported file type. Please upload .html, .css, .js files, or images."
        );
      }
    }

    setFileInputKey((prevKey) => prevKey + 1); // Reset the input field
  };
  const handleFileImport = (fileName, content) => {
    const existingFile = files.find((file) => file.name === fileName);
    if (existingFile) {
      alert("File already exists. Please choose a different file.");
      return;
    }
    dispatch(addFile({ name: fileName, content }));
  };
  const username = userInfo.username;
  const handleExportFiles = async () => {
    if (!files.length) {
      alert("No files to export.");
      return;
    }
  
    const zip = new JSZip();
  
    for (const file of files) {
      if (file.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
        // For image files, ensure content is base64 and remove the data URL prefix
        const base64Data = file.content.split(',')[1]; // Strip out the data URL prefix
        zip.file(file.name, base64Data, { base64: true }); // Use base64 content
      } else {
        // For text files
        zip.file(file.name, file.content);
      }
    }
  
    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `codecraft-${username}.zip`); // Save ZIP file
    } catch (error) {
      console.error("Failed to export files:", error);
    }
  };
  

  const handleremoveFile = () => {
    const fileToDelete = files[fileToDeleteIndex]; // Get the file object by index
    if (fileToDelete) {
      dispatch(removeFile({ fileName: fileToDelete.name })); // Pass the file name
      setOpenConfirmDialog(false);
    }
  };

  const [open, setOpen] = useState(true);

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "#f5f5f5",
        padding: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icons at the top */}
      <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
        <IconButton color="primary" onClick={() => setShowInput(true)}>
          <FaPlus title="Add File" />
        </IconButton>
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          Import
          <IconButton color="primary" component="span">
            <FaFileImport title="Import File" />
          </IconButton>
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
        {/* <IconButton color="primary" onClick={handleExportFiles}>
          <FaFileExport title="Export Files" />
        </IconButton> */}
      </Box>

      <Divider />

      {/* Input for creating a new file */}
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

      {/* Collapsible File List */}
      <List>
        <ListItemButton onClick={() => setOpen(!open)}>
          <ListItemText primary="Files" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {files.map((file, index) => (
              <ListItemButton
                sx={{ pl: 4 }}
                key={index}
                onClick={() => handleFileClick(file)}
              >
                <ListItemText primary={file.name} />
                <IconButton
                  color="error"
                  onClick={() => {
                    setFileToDeleteIndex(index);
                    setOpenConfirmDialog(true);
                  }}
                >
                  <Typography variant="button">Delete</Typography>
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ mt: 2 }} />

      {/* Action Buttons */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          marginTop: "auto",
        }}
      >
        <Button variant="contained" startIcon={<Save />} color="primary"  onClick={handleExportFiles}>
          Save
        </Button>
        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          color="primary"
          onClick={handleRunCode}
        >
          Run Code
        </Button>
      </Box>

      {/* Confirmation Dialog */}
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
          <Button onClick={handleremoveFile} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaygroundSidebar;
