import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: localStorage.getItem("userDetails")
    ? JSON.parse(localStorage.getItem("userDetails"))
    : null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userDetails = action.payload;
      localStorage.setItem("userDetails", JSON.stringify(action.payload));

      const expirationTime = new Date() + 30 * 24 * 60 * 60 * 1000; //30days expiration
      localStorage.setItem("expirationTime", expirationTime);
    },
    logout: (state) => {
      state.userDetails = null;
      localStorage.removeItem("userDetails");
      localStorage.removeItem("expirationTime");
      
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer;
