import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Spinner, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHands } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./styles.css";

export default function Dashboard() {
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      console.log("Token in useEffect:", token); // Debugging line

      try {
        // Ensure a token is present
        if (!token) {
          throw new Error("No token found");
        }

        // Fetch user data
        const userResponse = await axios.get(
          `https://backend-bora.onrender.com/user/token/${token}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        console.log("User Data:", userResponse.data); // Debugging line

        // Fetch transaction data
        const transactionsResponse = await axios.get(
          "https://backend-bora.onrender.com/user/transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        console.log("Transactions Data:", transactionsResponse.data); // Debugging line

        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error("Error:", error); // Debugging line
        toast.error(
          error.response?.data?.message || "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
          <span className="ms-2">Loading Dashboard...</span>
        </div>
      ) : user ? (
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h1>
              Welcome, {user.name}!
              <FontAwesomeIcon icon={faHands} className="ms-2" />
            </h1>
            <div className="balance-section">
              <h3>Balance</h3>
              <p>${user.balance}</p>
            </div>
            <div className="transactions-section">
              <h3>Transaction History</h3>
              <ul>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <li key={transaction._id}>
                      {transaction.date} - ${transaction.amount} -{" "}
                      {transaction.type}
                    </li>
                  ))
                ) : (
                  <p>No transactions found.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Unauthorized Access</h1>
          <p>Please log in to view this page.</p>
          <Button href="/login">Go to Login</Button>
        </div>
      )}
    </div>
  );
}
