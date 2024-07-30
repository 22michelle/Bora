import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Spinner, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHands } from "@fortawesome/free-solid-svg-icons";
import { fakeUserData, fakeTransactions } from "./data";
import "./styles.css";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Usa datos ficticios en lugar de una llamada a la API
        setUserData(fakeUserData);
        setTransactions(fakeTransactions);
      } catch (error) {
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
          <span className="ms-2">Loading Dashboard...</span>
        </div>
      ) : userData ? (
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h1>
              Welcome, {userData.name}!!
              <FontAwesomeIcon icon={faHands} />
            </h1>
            <div className="balance-section">
              <h3>Balance</h3>
              <p>${userData.balance}</p>
            </div>
            <div className="info-section">
              <div className="info-column">
                <p>
                  <strong>PR:</strong> {userData.public_rate}%
                </p>
              </div>
              <div className="info-column">
                <p>
                  <strong>Value:</strong> ${userData.value}
                </p>
              </div>
            </div>
            <div className="button-group">
              <Button variant="primary">Send</Button>
              <Button variant="primary">Deposit</Button>
              <Button variant="primary">Transfer</Button>
            </div>
          </div>

          <h3 className="transactions-heading">Transactions History</h3>
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div className="transaction-card" key={transaction._id}>
                <p>
                  <strong>Sender:</strong> {transaction.senderName}
                </p>
                <p>
                  <strong>Receiver:</strong> {transaction.receiverName}
                </p>
                <p>
                  <strong>Amount:</strong> ${transaction.amount}
                </p>
                <p>
                  <strong>Fee Rate:</strong> {transaction.fee_rate}%
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
