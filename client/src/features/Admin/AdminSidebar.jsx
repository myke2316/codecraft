import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../LoginRegister/userSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch()
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <nav>
        <ul>
          <li>
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin-users">Manage Users</Link>
          </li> 
          <li>
            <Link to="/admin-teacherRequest">Teacher Requests</Link>
          </li> 
          <li>
            <Link to="/admin-qna">Manage QnA</Link>
          </li> 
          <li>
            <Link onClick={() => dispatch(logout())}>Logout</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
