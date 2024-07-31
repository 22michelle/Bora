import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../redux/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "react-bootstrap";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Function to validate the login form
  const validateForm = () => {
    const newErrors = {};

    if (!data.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email))
      newErrors.email = "Email address is invalid";

    if (!data.password) newErrors.password = "Password is required";
    else if (data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";

    return newErrors;
  };

  // Function to handle user login
  const loginUser = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      for (const [key, message] of Object.entries(validationErrors)) {
        toast.error(message);
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "https://backend-bora.onrender.com/user/login",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const responseData = response.data;

      if (!responseData.ok) {
        toast.error(responseData.message || "Login Failed");
      } else {
        dispatch(setToken(responseData.token));
        dispatch(setUser(responseData.user));
        toast.success(
          responseData.message || "Login Successful, Welcome To Bora"
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(
        "Error during login:",
        error.response ? error.response.data : error.message
      );
      toast.error(
        error.response
          ? error.response.data.message || "An unexpected error occurred"
          : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-center">Login to Bora!!</h1>
        <form onSubmit={loginUser}>
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter Email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} /> Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          {/* Submit button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            Sign In
          </button>

          {/* Don't have an account? */}
          <div className="mt-3 text-center">
            <p className="fw-bold">
              Don't have an account?{" "}
              <a className="a" href="/register">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Overlay for loading spinner */}
      {loading && (
        <div className="overlay">
          <div className="spinner-container">
            <span className="ms-2">Wait A Few Minutes...</span>
            <Spinner animation="border" variant="light" />
          </div>
        </div>
      )}
    </div>
  );
}
