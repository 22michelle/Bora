import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Spinner,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import HeaderLogout from "../components/Logout.jsx";
import logo from "../../src/assets/logo1.png";

// Define formatNumber function
const formatNumber = (value) => {
  if (value !== undefined && value !== null) {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return value; // return as is if not a number
    }
    return numberValue % 1 === 0
      ? numberValue.toString()
      : numberValue.toFixed(2);
  }
  return "N/A"; // handle cases where value is undefined or null
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userId);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [formData, setFormData] = useState({
    receiverAccountNumber: "",
    amount: "",
    feeRate: "",
  });

  const [depositData, setDepositData] = useState({
    amount: "",
    accountNumber: "",
  });

  const [withdrawData, setWithdrawData] = useState({
    accountNumber: "",
    amount: "",
  });

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      const fetchData = async () => {
        setLoading(true);
        try {
          const userResponse = await axios.get(
            `https://backend-bora.onrender.com/user/${userId}`,
            { withCredentials: true }
          );

          if (userResponse.data?.data) {
            const userData = userResponse.data.data;
            setUser({
              ...userData,
              balance: formatNumber(userData.balance),
              public_rate: formatNumber(userData.public_rate),
              value: formatNumber(userData.value),
            });
            setTransactions(userData.transactionHistory || []);
          } else {
            throw new Error("User data not found");
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(
            error.response?.data?.message || "An unexpected error occurred"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userId, navigate]);

  const handleShowModal = (modal) => {
    switch (modal) {
      case "send":
        setShowSendModal(true);
        break;
      case "deposit":
        setShowDepositModal(true);
        break;
      case "transfer":
        setShowTransferModal(true);
        break;
      default:
        break;
    }
  };

  const handleCloseModal = (modal) => {
    switch (modal) {
      case "send":
        setShowSendModal(false);
        break;
      case "deposit":
        setShowDepositModal(false);
        break;
      case "transfer":
        setShowTransferModal(false);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value } = e.target;
    stateSetter((prev) => ({ ...prev, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Send
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { receiverAccountNumber, amount, feeRate } = formData;

    if (!receiverAccountNumber || !amount || !feeRate) {
      toast.error("Please fill out all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const senderAccountNumber = user.accountNumber;

      const response = await axios.post(
        "https://backend-bora.onrender.com/transaction/transaction",
        {
          senderAccountNumber,
          receiverAccountNumber,
          amount: Number(amount),
          feeRate: Number(feeRate),
        },
        { withCredentials: true }
      );

      toast.success("Transaction created successfully");
      handleCloseModal("send");

      const userResponse = await axios.get(
        `https://backend-bora.onrender.com/user/${userId}`,
        { withCredentials: true }
      );

      setUser({
        ...userResponse.data.data,
        balance: formatNumber(userResponse.data.data.balance),
        public_rate: formatNumber(userResponse.data.data.public_rate),
        value: formatNumber(userResponse.data.data.value),
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { amount } = depositData;
    const accountNumber = user.accountNumber;

    if (!amount) {
      toast.error("The amount is required");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(
        "https://backend-bora.onrender.com/transaction/deposit",
        { amount, accountNumber },
        { withCredentials: true }
      );
      toast.success("Deposit successful");
      setDepositData({ amount: "" });
      handleCloseModal("deposit");

      // Refresh user data
      const userResponse = await axios.get(
        `https://backend-bora.onrender.com/user/${userId}`,
        { withCredentials: true }
      );

      setUser({
        ...userResponse.data.data,
        balance: formatNumber(userResponse.data.data.balance),
        public_rate: formatNumber(userResponse.data.data.public_rate),
        value: formatNumber(userResponse.data.data.value),
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Withdraw
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { amount } = withdrawData;
    const accountNumber = user.accountNumber;

    if (!amount || amount <= 0) {
      toast.error("The amount is required");
      setIsSubmitting(false);
      return;
    }

    if (!user || amount > user.balance) {
      toast.error("Insufficient balance");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(
        "https://backend-bora.onrender.com/transaction/withdraw",
        { amount, accountNumber },
        { withCredentials: true }
      );
      toast.success("Withdrawal successful");
      setWithdrawData({ accountNumber: "", amount: "" });
      handleCloseModal("withdraw");

      // Refresh user data
      const userResponse = await axios.get(
        `https://backend-bora.onrender.com/user/${userId}`,
        { withCredentials: true }
      );

      setUser({
        ...userResponse.data.data,
        balance: formatNumber(userResponse.data.data.balance),
        public_rate: formatNumber(userResponse.data.data.public_rate),
        value: formatNumber(userResponse.data.data.value),
      });
    } catch (error) {
      console.error("Error withdraw:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="px-5 py-5 mt-4">
      <HeaderLogout />
      {loading ? (
        <div className="overlay">
          <div className="spinner-container">
            <span className="ms-2 text-light">Wait A Few Minutes...</span>
            <Spinner animation="border" variant="light" />
          </div>
        </div>
      ) : user ? (
        <>
          {/* Welcome */}
          <Col xs={12} md={12} className="mb-2">
            <Card className="p-3">
              <Card.Body>
                <Card.Title>
                  Hola, {user.name}
                  <FontAwesomeIcon icon={faAngleRight} />
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>

          {/* User Info */}
          <Card.Title className="fs-4 mb-1">Your Account</Card.Title>
          <Row className="mb-4">
            {/* User Info */}
            <Col xs={12} md={6} className="mb-3">
              <Card className="">
                <Card.Body>
                  <Card.Text>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Card.Title>Account Number:</Card.Title>
                        <Card.Title>{user.accountNumber}</Card.Title>
                      </Col>
                      <Col md={6} className="mt-3">
                        <Card.Title>Balance:</Card.Title>
                        <p className="fs-3">${formatNumber(user.balance)}</p>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Card.Title>PR:</Card.Title>
                        <p className="fs-3">{formatNumber(user.public_rate)}</p>
                      </Col>
                      <Col md={6}>
                        <Card.Title>Metabalance:</Card.Title>
                        <p className="fs-3">{formatNumber(user.value)}</p>
                      </Col>
                    </Row>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* Functions */}
            <Col xs={12} md={6} className="mb-3">
              <Card.Title className="fs-4 mb-1">
                What do you want to do today?
              </Card.Title>
              <Card>
                <Card.Body>
                  <Card.Text>
                    <Row className="mb-3">
                      <Col md={12} className="mt-3">
                        <Button
                          onClick={() => handleShowModal("send")}
                          className="w-100"
                          style={{
                            backgroundColor: "#c2cae4",
                            color: "black",
                            border: "none",
                            padding: "10px 20px",
                          }}
                        >
                          <img
                            src={logo}
                            alt="logo"
                            style={{
                              width: "30px",
                              height: "30px",
                            }}
                          />
                          Send
                        </Button>
                      </Col>
                      <Col md={6} className="mt-3">
                        <Button
                          onClick={() => handleShowModal("deposit")}
                          className="btn w-100"
                          style={{
                            backgroundColor: "#c2cae4",
                            color: "black",
                            border: "none",
                            padding: "10px 20px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowDown}
                            className="me-2"
                          />
                          Deposit
                        </Button>
                      </Col>
                      <Col md={6} className="mt-3">
                        <Button
                          onClick={() => handleShowModal("transfer")}
                          className="btn w-100"
                          style={{
                            backgroundColor: "#c2cae4",
                            color: "black",
                            border: "none",
                            padding: "10px 20px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowUp}
                            className="me-2"
                          />
                          Withdraw
                        </Button>
                      </Col>
                    </Row>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Modals */}
          {/* Send Modal */}
          <Modal show={showSendModal} onHide={() => handleCloseModal("send")}>
            <Modal.Header closeButton>
              <Modal.Title>Send Money</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Receiver's Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="receiverAccountNumber"
                    value={formData.receiverAccountNumber}
                    onChange={(e) => handleInputChange(e, setFormData)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange(e, setFormData)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Fee Rate</Form.Label>
                  <Form.Control
                    type="number"
                    name="feeRate"
                    value={formData.feeRate}
                    onChange={(e) => handleInputChange(e, setFormData)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Send"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Deposit Modal */}
          <Modal
            show={showDepositModal}
            onHide={() => handleCloseModal("deposit")}
          >
            <Modal.Header closeButton>
              <Modal.Title>Deposit Money</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleDeposit}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={depositData.amount}
                    onChange={(e) => handleInputChange(e, setDepositData)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Deposit"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Withdraw Modal */}
          <Modal
            show={showTransferModal}
            onHide={() => handleCloseModal("transfer")}
          >
            <Modal.Header closeButton>
              <Modal.Title>Withdraw Money</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleWithdraw}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={withdrawData.amount}
                    onChange={(e) => handleInputChange(e, setWithdrawData)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Withdraw"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <p>No user data available.</p>
      )}
    </Container>
  );
}
