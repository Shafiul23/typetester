// src/App.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import TypeTest from "./pages/TypeTest/TypeTest";
import Profile from "./pages/Profile/Profile";

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/typetest" element={<TypeTest />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

export default App;
