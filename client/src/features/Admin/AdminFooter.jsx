import React from "react";

const AdminFooter = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>
        &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
      </p>
    </footer>
  );
};

export default AdminFooter;
