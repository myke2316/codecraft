import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  files: localStorage.getItem("sandboxFiles")
    ? JSON.parse(localStorage.getItem("sandboxFiles"))
    : [],
};

const sandboxSlice = createSlice({
  name: "sandbox",
  initialState,
  reducers: {
    setFileContent: (state, action) => {
      const { fileName, content } = action.payload;
      const file = state.files.find((f) => f.name === fileName);
      if (file) {
        file.content = content;
        localStorage.setItem("sandboxFiles", JSON.stringify(state.files));
      }
    },
    addFile: (state, action) => {
      const { name, content, fileExtension } = action.payload;

      // Check for duplicates
      const fileExists = state.files.some((file) => file.name === name);
      if (fileExists) {
        alert(`A file with the name "${name}" already exists.`);
        return; // Exit if duplicate
      }

      // Add new file
      const newFile = {
        name,
        content: content || "", // Optional content
        fileExtension,
      };
      state.files.push(newFile);
      localStorage.setItem("sandboxFiles", JSON.stringify(state.files));
    },
    setFileName: (state, action) => {
      const { oldName, newName } = action.payload;

      // Check for duplicate new name
      const fileExists = state.files.some((file) => file.name === newName);
      if (fileExists) {
        alert(`A file with the name "${newName}" already exists.`);
        return;
      }

      // Find and rename the file
      const file = state.files.find((f) => f.name === oldName);
      if (file) {
        file.name = newName;
        localStorage.setItem("sandboxFiles", JSON.stringify(state.files));
      }
    },
    removeFile: (state, action) => {
      const { fileName } = action.payload;
      state.files = state.files.filter((file) => file.name !== fileName);
      localStorage.setItem("sandboxFiles", JSON.stringify(state.files));
    },
    resetSandbox: (state) => {
      state.files = [];
      localStorage.setItem("sandboxFiles", JSON.stringify(state.files));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.files = [];
      localStorage.removeItem("sandboxFiles");
    });
  },
});

// Export actions
export const { setFileContent, addFile, setFileName, removeFile, resetSandbox } =
  sandboxSlice.actions;

// Export reducer
export default sandboxSlice.reducer;
