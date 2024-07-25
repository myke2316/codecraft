import React from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import "./activityLayout.css";

function ActivityLayout() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="activity-layout">
      <nav className="navbar">
        <button
          onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
          className="back-button"
        >
          Back
        </button>
        <h2>Activity Page</h2>
      </nav>
      <Outlet />
    </div>
  );
}

export default ActivityLayout;
