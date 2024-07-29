import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Function to validate the form data
  const validateForm = () => {
    const newErrors = {};

    if (!data.name) newErrors.name = "Name is required";

    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!data.password) newErrors.password = "Password is required";
    if (!data.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    else if (data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";

    if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  // Function to handle user registration
  const registerUser = async (e) => {
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

    const { name, email, password, confirmPassword } = data;

    try {
      const response = await axios.post(
        "http://localhost:4000/user/register",
        { name, email, password, confirmPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const responseData = response.data;

      if (!responseData.ok) {
        toast.error(responseData.message || "Registration failed");
      } else {
        setData({ name: "", email: "", password: "", confirmPassword: "" });
        toast.success(
          responseData.message || "Registration Successful, Welcome!"
        );
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          error.response.data.message || "An unexpected error occurred"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-center">Welcome to Bora!!</h1>
        <form onSubmit={registerUser}>
          {/* Name input */}
          <div className="form-group">
            <label htmlFor="name">
              <FontAwesomeIcon icon={faUser} /> Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="johndoe@example.com"
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

          {/* Confirm Password input */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FontAwesomeIcon icon={faLock} /> Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={data.confirmPassword}
              onChange={(e) =>
                setData({ ...data, confirmPassword: e.target.value })
              }
              className={`form-control ${errors.Password ? "is-invalid" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" size="lg" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Registering...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
          {/* Already have an account */}
          <div className="mt-3 text-center">
            <p className="fw-bold">
              Already have an account?{" "}
              <a className="a" href="/login">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
