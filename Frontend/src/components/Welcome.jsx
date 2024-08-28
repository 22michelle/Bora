import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";

const Welcome = () => {
  const user = {
    balance: 2772.95,
    value: 4900,
    public_rate: 7.38,
    numberAccount: 4875748373,
    auxiliary: 20,
  };

  return (
    <>
      <Container className="">
        <Row className="justify-content-center">
          <Col xs={12} md={6} className="text-center">
            <h2 className="mb-4" style={{ fontSize: "2rem", marginTop: "20%" }}>
              ¡Bora is not just another wallet!
            </h2>
            <p className="mb-4" style={{ fontSize: "1.2rem" }}>
              It's powered by the Resilience Network Protocol, connecting users
              globally in a secure and transparent way.
            </p>
            <hr />
            <p className="mb-4" style={{ fontSize: "1.2rem" }}>
              "May your connections be stronger"
            </p>
            <Row className="justify-content-center text-center mb-5">
              <Col xs={12} md={6} className="mb-4">
                <Link
                  to="/register"
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
                  className="text-decoration-none"
                >
                  <span className="me-2">Get Started</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </Col>
              <Col xs={12} md={6} className="mb-4">
                <Link
                  to="/"
                  style={{
                    background: "rgb(242,224,213)",
                    background:
                      "linear-gradient(90deg, rgba(242,224,213,1) 50%, rgba(194,202,228,1) 100%)",
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
                  className="text-decoration-none"
                >
                  How it works
                </Link>
              </Col>
            </Row>
          </Col>
          {/* Bora Card */}
          <Col xs={12} md={6} style={{ marginTop: "10%" }}>
            <Card
              style={{
                borderRadius: "1rem",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
                backgroundColor: "#1c1f24",
                color: "white",
                padding: "1.5rem",
                position: "relative",
                backgroundImage:
                  "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
                backgroundSize: "cover",
                overflow: "hidden",
              }}
            >
              <Card.Body>
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1.5rem",
                    fontSize: "1rem",
                    color: "white",
                  }}
                >
                  <span>VALID THRU</span>
                  <br />
                  <strong>12/26</strong>
                </div>
                <Card.Title className="text-uppercase mb-4">
                  <span style={{ fontSize: "1.2rem" }}>Bora Card</span>
                </Card.Title>
                <div
                  style={{
                    letterSpacing: "0.2rem",
                    marginBottom: "1.5rem",
                    fontSize: "1.25rem",
                  }}
                >
                  {user.numberAccount}
                </div>
                <Row className="mb-3">
                  <Col>
                    <h5>Balance</h5>
                    <h4>
                      ${user.balance.toFixed(2)}
                      <FontAwesomeIcon
                        icon={faArrowTrendUp}
                        className="ms-1 text-success"
                      />
                    </h4>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col xs={4} className="text-center">
                    <h6>PR</h6>
                    <Badge
                      pill
                      className="bg-white"
                      style={{
                        fontSize: "1rem",
                        padding: "0.5rem",
                        color: "black",
                      }}
                    >
                      {user.public_rate}
                    </Badge>
                  </Col>
                  <Col xs={4} className="text-center">
                    <h6>Value</h6>
                    <Badge
                      pill
                      className="bg-white"
                      style={{
                        fontSize: "1rem",
                        padding: "0.5rem",
                        color: "black",
                      }}
                    >
                      {user.value}
                    </Badge>
                  </Col>
                  <Col xs={4} className="text-center">
                    <h6>Auxiliary</h6>
                    <Badge
                      pill
                      className="bg-white"
                      style={{
                        fontSize: "1rem",
                        padding: "0.5rem",
                        color: "black",
                      }}
                    >
                      {user.auxiliary}
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Welcome;
