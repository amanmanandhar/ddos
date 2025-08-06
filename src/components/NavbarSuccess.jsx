import React from "react";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h1>DDoS Attack Detection & Mitigation</h1>
      </div>

      <nav className="navbar-menu">
        <ul>
          <li>Dashboard</li>
          <li onClick={onLogout} className="logout-btn">Logout</li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
