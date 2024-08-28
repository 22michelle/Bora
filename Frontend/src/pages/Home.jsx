import React from "react";
import Footer from "../components/Footer.jsx";
import Form from "../components/FormSupport.jsx";
import Welcome from "../components/Welcome.jsx";
import "../App.css";
import { Container } from "react-bootstrap";

export default function Home() {
  return (
    <>
      <Container>
        <Welcome />
        <Form />
      </Container>
      <Footer />
    </>
  );
}
