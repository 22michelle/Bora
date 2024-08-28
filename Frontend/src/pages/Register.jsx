
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Container, Row, Col, Card } from "react-bootstrap";
import Footer from "../components/Footer";
import logo from "../../src/assets/logo1.png";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        "https://backend-bora.onrender.com/user/register",
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
    <>
      <Container
        className="p-6"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50%",
          padding: "6rem",
        }}
      >
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={12} className="d-flex justify-content-center">
            <Card
              className=""
              style={{
                marginTop: "100px",
                marginBottom: "100px",
                padding: "50px",
                width: "500px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                />
              </div>
              <h1 className="text-center">Sign Up</h1>
              <p
                className="text-center fw-bold fs-6"
                style={{
                  color: "GrayText",
                }}
              >
                Enter your deatils below to create your account and get started
              </p>

              <form onSubmit={registerUser}>
                {/* Name input */}
                <div>
                  <label htmlFor="name">
                    <FontAwesomeIcon icon={faUser} /> Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    style={{
                      background: "#f9f9f",
                      border: "1px solid #000000",
                      color: "black",
                      borderRadius: "0.25rem",
                      width: "100%",
                      boxSizing: "border-box",
                      marginBottom: "25px",
                    }}
                  />
                  {errors.name && <p className="error">{errors.name}</p>}
                </div>

                {/* Email input */}
                <div>
                  <label htmlFor="email">
                    <FontAwesomeIcon icon={faEnvelope} /> Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    value={data.email}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    style={{
                      background: "#f9f9f",
                      border: "1px solid #000000",
                      color: "black",
                      borderRadius: "0.25rem",
                      width: "100%",
                      boxSizing: "border-box",
                      marginBottom: "25px",
                    }}
                    autoComplete="current-email"
                  />
                  {errors.email && <p className="error">{errors.email}</p>}
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="password">
                    <FontAwesomeIcon icon={faLock} /> Password
                  </label>
                  <div className="input-group">
                    <input
                      id="password"
                      type={!showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={data.password}
                      onChange={(e) =>
                        setData({ ...data, password: e.target.value })
                      }
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      style={{
                        background: "#f9f9f",
                        border: "1px solid #000000",
                        color: "black",
                        borderRadius: "0.25rem 0 0 0.25rem",
                        boxSizing: "border-box",
                        marginBottom: "25px",
                      }}
                      autoComplete="current-password"
                    />
                    <div className="input-group-append">
                      <span
                        className="input-group-text"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          cursor: "pointer",
                          borderRadius: "0 0.25rem 0.25rem 0",
                          border: "1px solid #000000",
                          background: "#f9f9f",
                          color: "black",
                          padding: "0.75rem",
                          marginBottom: "25px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </span>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="error">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password input */}
                <div>
                  <label htmlFor="confirmPassword">
                    <FontAwesomeIcon icon={faLock} /> Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      id="confirmPassword"
                      type={!showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={data.confirmPassword}
                      onChange={(e) =>
                        setData({ ...data, confirmPassword: e.target.value })
                      }
                      className={`form-control ${
                        errors.confirmPassword ? "is-invalid" : ""
                      }`}
                      style={{
                        background: "#f9f9f",
                        border: "1px solid #000000",
                        color: "black",
                        borderRadius: "0.25rem 0 0 0.25rem",
                        boxSizing: "border-box",
                        marginBottom: "25px",
                      }}
                      autoComplete="current-password"
                    />
                    <div className="input-group-append">
                      <span
                        className="input-group-text"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{
                          cursor: "pointer",
                          borderRadius: "0 0.25rem 0.25rem 0",
                          border: "1px solid #000000",
                          background: "#f9f9f",
                          color: "black",
                          padding: "0.75rem",
                          marginBottom: "25px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </span>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="error">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{
                    background: "#6884e1",
                    color: "white",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    border: "1px solid #000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  Sign Up
                </button>

                {/* Already have an account */}
                <div className="mt-3 text-center">
                  <p className="fw-bold fs-6">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      style={{
                        color: "#6884e1",
                        textDecoration: "none",
                      }}
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </Card>

            {/* Overlay for loading spinner */}
            {loading && (
              <div className="overlay">
                <div className="spinner-container">
                  <span className="ms-2 text-white">
                    Wait A Few Minutes...{" "}
                    <Spinner animation="border mt-2" variant="light" />
                  </span>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      {/* Footer */}
      <Footer />
    </>
  );
}
