import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "../src/pages/Home.jsx";
import Login from "../src/pages/Login.jsx";
import Register from "../src/pages/Register.jsx";
import Dashboard from "./pages/Dasboard.jsx";
import axios from "axios";
import { Toaster } from "react-hot-toast";

axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.withCredentials = true;

function App() {
  const location = useLocation();

  // Header Token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return (
    <>
      {/* Conditionally render Header */}
      {location.pathname !== "/dashboard" && <Header />}
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
