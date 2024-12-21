// src/App.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar/Navbar";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import TypeTest from "./pages/TypeTest/TypeTest";
import Leaderboard from "./pages/Leaderboard/Leaderboard";

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route element={<PrivateRoute />}>
          <Route path="/typetest" element={<TypeTest />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
