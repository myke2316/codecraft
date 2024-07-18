import React from "react";
import { Outlet, useNavigate } from "react-router";
import "./activityLayout.css";

function ActivityLayout() {
  const navigate = useNavigate();

  return (
    <div className="activity-layout">
      <nav className="navbar">
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>
        <h2>Activity Page</h2>
      </nav>
      <Outlet />
    </div>
  );
}

export default ActivityLayout;
