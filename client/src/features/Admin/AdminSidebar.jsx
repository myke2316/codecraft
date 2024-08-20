import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <nav>
        <ul>
          <li>
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin-users">Users</Link>
          </li>
          <li>
            <Link to="/admin-home">Home</Link>
          </li>
          <li>
            <Link to="/admin-settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
