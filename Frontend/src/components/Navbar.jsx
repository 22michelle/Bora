import React from "react";
import { Link } from "react-router-dom";
import "../App.css"

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Bora</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/register" className="navbar-link">Register</Link>
          <Link to="/login" className="navbar-link">Login</Link>
        </div>
      </div>
    </nav>
  );
}
