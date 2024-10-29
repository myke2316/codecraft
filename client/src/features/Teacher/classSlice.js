import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

// const initialState = {
//   class: localStorage.getItem("class")
//     ? JSON.parse(localStorage.getItem("class"))
//     : [],
// };


const storedClass = localStorage.getItem("class");

if (storedClass === "undefined") {
  localStorage.removeItem("class");
}

const initialState = {
  class: storedClass !== undefined ? JSON.parse(storedClass) : [],
};
const storage = localStorage.getItem("class");

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    // setClass: (state, action) => {
    //   !storage
    //     ? (state.class = action.payload)
    //     : state.class.push(action.payload);
    //   localStorage.setItem("class", JSON.stringify(state.class));
    // },
    setClass: (state, action) => {
      state.class = action.payload;
      localStorage.setItem("class", JSON.stringify(state.class));
    },
    addClass: (state, action) => {
      state.class.push(action.payload);
      localStorage.setItem("class", JSON.stringify(state.class));
    },
    addStudent: (state, action) => {
      state.class = action.payload;
      localStorage.setItem("class", JSON.stringify(state.class));
    },
    updateClassNameReducer: (state, action) => {
      const { classId, newClassName } = action.payload;
      const classToUpdate = state.class.find((c) => c._id === classId);
      if (classToUpdate) {
        classToUpdate.className = newClassName;
        localStorage.setItem("class", JSON.stringify(state.class));
      }
    },
    updateClassStudent: (state, action) => {
      state.class = action.payload;
      localStorage.setItem("class", JSON.stringify(state.class));
    },
    removeStudentReducer: (state, action) => {
      const { classId, studentId } = action.payload;
      const classToUpdate = state.class.find((c) => c._id === classId);
      if (classToUpdate) {
        classToUpdate.students = classToUpdate.students.filter(
          (student) => student !== studentId
        );
        localStorage.setItem("class", JSON.stringify(state.class));
      }
    },
    updateClass: (state, action) => {
      const { classId, updatedClass } = action.payload;
      const classIndex = state.class.findIndex((c) => c._id === classId);
      if (classIndex !== -1) {
        state.class[classIndex] = {
          ...state.class[classIndex],
          ...updatedClass,
        };
        localStorage.setItem("class", JSON.stringify(state.class));
      }
    },
    
    leaveClass: (state, action) => {
      state.class = [];
      localStorage.removeItem("userAnalytics");
      localStorage.removeItem("activitySubmissions");
      localStorage.removeItem("quizSubmissions");
      localStorage.removeItem("class");
      localStorage.removeItem("userProgress");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.class = null;
      localStorage.removeItem("class");
    });
  },
});

export const {
  setClass,
  addClass,
  addStudent,
  updateClassNameReducer,
  removeStudentReducer,
  updateClass,
  updateClassStudent,
  leaveClass,
} = classSlice.actions;
export default classSlice.reducer;
