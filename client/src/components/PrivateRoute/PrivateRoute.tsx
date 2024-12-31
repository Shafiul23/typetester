import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../Loading/Loading";

const PrivateRoute: React.FC = () => {
  const { userId, setUserId, setUsername } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.user_id);
        setUsername(payload.username);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, [setUserId, setUsername]);

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
