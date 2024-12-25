import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute: React.FC = () => {
  const { userId, checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus().finally(() => setLoading(false));
  }, [checkAuthStatus]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
