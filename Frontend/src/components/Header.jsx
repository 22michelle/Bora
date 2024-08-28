import React from "react";
import { Link } from "react-router-dom";
import logo from "../../src/assets/logo1.png";

export default function Header() {
  const closeToggler = () => {
    const toggler = document.querySelector(".navbar-toggler");
    const collapse = document.querySelector("#navbarNav");
    if (collapse.classList.contains("show")) {
      toggler.click();
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeToggler}>
            <img
              src={logo}
              alt="Bora"
              className="navbar-logo-img"
              style={{ width: "50px" }}
            />
            <h2 className="mt-2 d-inline ms-2">Bora</h2>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto" style={{ padding: "10px" }}>
              <li className="nav-item">
                <Link
                  to="/"
                  className="nav-link text-center mx-auto me-2"
                  onClick={closeToggler}
                  style={{
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/login"
                  className="nav-link text-center mx-auto me-2"
                  onClick={closeToggler}
                  style={{
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  Log In
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link text-center mx-auto me-2"
                  onClick={closeToggler}
                  style={{
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <hr />
      </nav>
    </>
  );
}
