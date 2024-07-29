import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from 'react-bootstrap';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/user/id", {
          withCredentials: true,
        });

        if (response.data.ok) {
          setUserData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        toast.error(error.response ? error.response.data.message : "An unexpected error occurred");
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
        <div>
          <h1>Welcome, {userData.name}</h1>
          {/* Display user data here */}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}