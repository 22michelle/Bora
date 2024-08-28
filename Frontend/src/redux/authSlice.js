import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: localStorage.getItem("userId") || null,
    transactionId: localStorage.getItem("transactionId") || null,
    user: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.userId = action.payload._id;
      localStorage.setItem("userId", action.payload._id);
    },
    setTransactionId(state, action) {
      state.transactionId = action.payload;
      localStorage.setItem("transactionId", action.payload);
    },
    clearUser(state) {
      state.user = null;
      state.userId = null;
      state.transactionId = null;
      localStorage.removeItem("userId");
      localStorage.removeItem("transactionId");
    },
    logout(state) {
      state.user = null;
      state.userId = null;
      state.transactionId = null;
      localStorage.removeItem("userId");
      localStorage.removeItem("transactionId");
    }
  },
});


export const { setUser, setTransactionId, clearUser, logout } = authSlice.actions;

export default authSlice.reducer;
