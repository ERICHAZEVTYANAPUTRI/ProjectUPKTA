import React from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const DashboardPengelolaGKT = () => {
  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title">DASHBOARD</h1>
      <div className="dashboard-content">
        <h2>Welcome to Pengelola GKT Dashboard</h2>
      </div>
    </div>
  );
};

export default DashboardPengelolaGKT;
