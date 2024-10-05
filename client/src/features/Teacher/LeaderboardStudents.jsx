import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LeaderboardStudents = ({ students, classId }) => {
  const [sortBy, setSortBy] = useState("points");
  const [mode, setMode] = useState("light");
  const userRole = useSelector((state) => state.user.userDetails.role);

  // Load saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  // Toggle light/dark mode
  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  // Sort students by total points earned or alphabetically
  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === "points") {
      return b.totalPointsEarned - a.totalPointsEarned;
    } else if (sortBy === "name") {
      return a.username.localeCompare(b.username);
    }
    return 0;
  });

  return (
    <div
      className={`${
        mode === "light" ? "bg-white text-gray-900" :  "text-white"
      } p-6 rounded-lg shadow-md transition-colors duration-300`}
    >
 

      <h2 className="text-2xl font-semibold mb-4">
        Students
      </h2>

      {/* Sort options */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <label
          htmlFor="sort-by"
          className="block text-sm font-bold mb-2"
        >
          Sort by:
        </label>
        <motion.select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`p-3 w-full border rounded-lg shadow-sm transition-transform duration-200 focus:ring-2 focus:ring-blue-400 ${
            mode === "light"
              ? "bg-gray-50 border-gray-300 text-gray-700"
              : "bg-gray-700 border-gray-600 text-white"
          }`}
          whileFocus={{ scale: 1.05 }}
        >
          <option value="points">Total Points</option>
          <option value="name">Name</option>
        </motion.select>
      </motion.div>

      {/* Display students */}
      {sortedStudents.length > 0 ? (
        <ul className="space-y-4">
          {sortedStudents.map((student, index) => (
            <Link
              key={student._id}
              to={
                userRole === "teacher"
                  ? `/${classId}/class/students/${student._id}`
                  : console.log("STUDENT PROFILE VIEW")
              }
              className="block"
            >
              <motion.li
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }}
                className={`flex justify-between items-center p-5 rounded-lg shadow transition-shadow duration-200 ${
                  mode === "light"
                    ? "bg-gradient-to-r  from-purple-100 via-indigo-100 to-indigo-50"
                    : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500"
                }`}
              >
                <div className="flex items-center">
                  {/* Display trophy emojis based on rank */}
                  {sortBy === "points" && (
                    <motion.div
                      className="mr-4 text-3xl"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : ""}
                    </motion.div>
                  )}
                  <div>
                    <p className="text-xl font-semibold">
                      {student.username}
                    </p>
                    <p className="text-sm">
                      {student.email}
                    </p>
                  </div>
                </div>
                {/* Conditionally render points based on sorting */}
                {sortBy === "points" && (
                  <div className="text-lg font-bold">
                    {student.totalPointsEarned} Points
                  </div>
                )}
              </motion.li>
            </Link>
          ))}
        </ul>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500"
        >
          No students have joined this class yet.
        </motion.p>
      )}
    </div>
  );
};

export default LeaderboardStudents;
