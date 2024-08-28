import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import App from "./App.jsx";
import "./App.css";
import axios from "axios";
import { BrowserRouter as Router } from "react-router-dom";

axios.defaults.baseURL = "https://backend-bora.onrender.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);
