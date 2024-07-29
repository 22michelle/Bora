import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

export default function Home() {
  return (
    <Container className="home-container text-center">
      <Row className="align-items-center justify-content-center min-vh-100">
        <Col md={8} lg={6}>
          <h1 className="display-3 text-light mb-4">Welcome to Bora!</h1>
          <p className="lead text-light mb-4">
            Bora is not just another wallet. It's powered by the Resilience
            Network Protocol, connecting users globally in a secure and
            transparent way. <br />
            <hr /> <span>"May your connections be stronger"</span>
          </p>
          <Link to="/register">
            <button size="lg" className="btn explore">
              Explore Bora
            </button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}
