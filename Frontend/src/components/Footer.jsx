import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import logo from "../../src/assets/Logo2.png";

const Footer = () => {
  return (
    <footer className="footer text-white my-auto">
      <Row className="align-items-center">
        <Col className="text-start">
          <div className=" mb-2">
            <a
              href="#Home"
              data-event="logo | footer-logo"
              className="d-flex align-items-center p-3 justify-content-start fs-2"
            >
              <img
                src={logo}
                alt="Logo"
                className="img-fluid"
                style={{ maxHeight: "50px" }}
              />
            </a>
          </div>
        </Col>
      </Row>
      <hr className="border-gray-600 my-auto" />
      <Row className="align-items-center p-3">
        <Col className="text-start">
          <span className="text-white fs-6">
            &copy; {new Date().getFullYear()} Bora. All Rights Reserved.
          </span>
        </Col>
        <Col className="text-end">
          <a href="#" className="text-white text-decoration-none mx-2">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
