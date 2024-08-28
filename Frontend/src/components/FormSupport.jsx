import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import emailjs from "emailjs-com";
import toast, { Toaster } from "react-hot-toast";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/contact.jpg";

const SupportForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    };

    if (!formData.firstName) {
      newErrors.firstName = "First Name is required";
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last Name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
      isValid = false;
    }

    if (!formData.message) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const serviceID = "service_674nm7u";
    const templateID = "template_lcgqhow";
    const userID = "6TbC4y0Ul_JmPMD_U";

    emailjs
      .send(serviceID, templateID, formData, userID)
      .then((response) => {
        console.log("Email successfully sent:", response);
        toast.success("Your message has been sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        });
        setErrors({});
      })
      .catch((error) => {
        console.log("Failed to send email:", error);
        toast.error("Failed to send your message. Please try again later.");
      });
  };

  return (
    <Container fluid id="Contact" className="px-5 py-5">
      <Row className="justify-content-center">
        {/* Img */}
        <Col xs={12} md={6} className="d-flex flex-column align-items-center">
          <img
            src={logo}
            alt="Support"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "3px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          />
          <div
            style={{
              marginBottom: "40px",
              padding: "1.5rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              background:
                "linear-gradient(90deg, rgba(242,224,213,1) 50%, rgba(194,202,228,1) 100%)",
              color: "black",
              textAlign: "center",
              width: "100%",
              height: "auto",
              borderRadius: "3px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2>Contact Us</h2>
            <p>
              Ask about our platform, implementation, or anything. Our highly
              trained reps are standing by, ready to help.
            </p>
          </div>
        </Col>
        {/* Form */}
        <Col xs={12} md={6}>
          <div
            className="p-4"
            style={{
              height: "98%",
            }}
          >
            <Form onSubmit={handleSubmit}>
              {Object.values(errors).some((error) => error) && (
                <Alert variant="danger">
                  {Object.values(errors)
                    .filter((error) => error)
                    .join(", ")}
                </Alert>
              )}

              <Row
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h3>
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="me-2"
                  />
                  Form Support
                </h3>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your first name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      isInvalid={!!errors.firstName}
                      style={{
                        background: "#f9f9f",
                        border: "1px solid #000000",
                        color: "black",
                        paddding: "0.75rem",
                        borderRadius: "0.25rem",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      isInvalid={!!errors.lastName}
                      style={{
                        background: "#f9f9f",
                        border: "1px solid #000000",
                        color: "black",
                        paddding: "0.75rem",
                        borderRadius: "0.25rem",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  style={{
                    background: "#f9f9f",
                    border: "1px solid #000000",
                    color: "black",
                    paddding: "0.75rem",
                    borderRadius: "0.25rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter your message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  isInvalid={!!errors.message}
                  style={{
                    background: "#f9f9f",
                    border: "1px solid #000000",
                    color: "black",
                    paddding: "0.75rem",
                    borderRadius: "0.25rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                type="submit"
                style={{
                  background: "#c2cae4",
                  color: "black",
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
                Send Message
              </Button>
            </Form>
            <Toaster />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SupportForm;
