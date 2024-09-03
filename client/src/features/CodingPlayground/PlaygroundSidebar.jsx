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
import { useUploadFileMutation } from "./fileService";
import { useSelector } from "react-redux";

const PlaygroundSidebar = ({ handleRunCode, handleFileClick }) => {
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem("savedFiles");
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  // For adding file
  const [showInput, setShowInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [uploadFile] = useUploadFileMutation(); // Hook for uploading files

  function handleFileAdd() {
    setShowInput(true);
  }

  const userId = useSelector((state) => state.user.userDetails._id);

  // Handle file creation and upload
  const handleCreateFile = async () => {
    if (
      newFileName.endsWith(".html") ||
      newFileName.endsWith(".css") ||
      newFileName.endsWith(".js")
    ) {
      if (files.includes(newFileName)) {
        alert("File already exists");
      } else {
        try {
          // Create a new Blob with empty content for the file
          const fileBlob = new Blob([""], { type: "text/plain" });
          const formData = new FormData();
          formData.append("files", fileBlob, newFileName); 
          formData.append("userId", userId); // Replace with actual user ID
        
          // Upload file using mutation
          const response = await uploadFile(formData).unwrap();

          // Update file list and local storage
          setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, newFileName];
            localStorage.setItem("savedFiles", JSON.stringify(updatedFiles));
            return updatedFiles;
          });

          // Reset input field and hide it
          setNewFileName("");
          setShowInput(false);
          console.log("File uploaded successfully:", response);
        } catch (error) {
          console.log(error)
          console.error("Error uploading file:", error);
          alert("Failed to upload file");
        }
      }
    } else {
      alert("File must be an .html, .css, or .js file");
    }
  };

  // Handle file deletion
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");
  function handleDeleteFile() {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file !== fileToDelete);
      localStorage.setItem("savedFiles", JSON.stringify(updatedFiles));
      return updatedFiles;
    });
    setFileToDelete("");
    setOpenConfirmDialog(false);
  }

  // Handle collapsible menu
  const [open, setOpen] = useState(true);
  function handleClick() {
    setOpen(!open);
  }

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        bgcolor: "#f5f5f5",
        boxShadow: 3,
        padding: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icons at the top */}
      <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
        <IconButton color="primary">
          <FaPlus title="Add File" onClick={handleFileAdd} />
        </IconButton>
        <IconButton color="primary">
          <FaFileImport title="Import File" />
        </IconButton>
        <IconButton color="primary">
          <FaFileExport title="Export Files" />
        </IconButton>
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
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateFile();
              }
            }}
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
        <ListItemButton onClick={handleClick}>
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
                <ListItemText primary={file} />
                <IconButton
                  color="error"
                  onClick={() => {
                    setFileToDelete(file);
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
        <Button variant="contained" startIcon={<Save />} color="primary">
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
          <Typography>
            Are you sure you want to delete "{fileToDelete}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteFile} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaygroundSidebar;
