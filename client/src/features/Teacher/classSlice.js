import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  class: localStorage.getItem("class")
    ? JSON.parse(localStorage.getItem("class"))
    : [],
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
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.class = null;
      localStorage.removeItem("class");
    });
  },
});

export const { setClass, addClass, addStudent } = classSlice.actions;
export default classSlice.reducer;
