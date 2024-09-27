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
    editUsername: (state, action) => {
      const { newUsername } = action.payload;

      // Update the username in the userDetails
      if (state.userDetails) {
        state.userDetails.username = newUsername;

        // Update the localStorage with new username
        localStorage.setItem("userDetails", JSON.stringify(state.userDetails));
      }
    },
  },
});

export const { setCredentials, logout, editUsername } = userSlice.actions;
export default userSlice.reducer;
