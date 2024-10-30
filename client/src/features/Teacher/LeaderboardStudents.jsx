import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetScoreByStudentIdQuery } from "../Class/submissionAssignmentService";
import { useGetUserVoteQuery } from "../QnA/questionService";

const LeaderboardStudents = ({ students, classId }) => {
  const [sortBy, setSortBy] = useState("points");
  const [mode, setMode] = useState("light");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  
  const userRole = useSelector((state) => state.user.userDetails.role);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  // Create a mapping of student IDs to scores and votes
  const studentData = students.map(student => {
    const scoreData = useGetScoreByStudentIdQuery(student._id);
    const voteData = useGetUserVoteQuery({ userId: student._id });

    return {
      student,
      scoreData,
      voteData
    };
  });

  const sortedStudents = useMemo(() => {
    return [...studentData].sort((a, b) => {
      if (sortBy === "points") {
        const submissionPointsA = a.scoreData.data?.scores.reduce(
          (acc, score) => acc + (score.grade || 0),
          0
        ) || 0;

        const qnaPointsA = (a.voteData.data?.totalVotes || 0) * 5;
        const totalPointsA = (a.student.totalPointsEarned || 0) + qnaPointsA + submissionPointsA;

        const submissionPointsB = b.scoreData.data?.scores.reduce(
          (acc, score) => acc + (score.grade || 0),
          0
        ) || 0;

        const qnaPointsB = (b.voteData.data?.totalVotes || 0) * 5;
        const totalPointsB = (b.student.totalPointsEarned || 0) + qnaPointsB + submissionPointsB;

        return totalPointsB - totalPointsA;
      } else if (sortBy === "name") {
        return a.student.username.localeCompare(b.student.username);
      }
      return 0;
    });
  }, [studentData, sortBy]);

  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  const currentStudents = sortedStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <div
      className={`${
        mode === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-white"
      } p-4 sm:p-6 rounded-lg shadow-md transition-colors duration-300`}
    >
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Students</h2>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <label htmlFor="sort-by" className="block text-sm font-bold mb-2">
          Sort by:
        </label>
        <motion.select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`p-2 sm:p-3 w-full border rounded-lg shadow-sm transition-transform duration-200 focus:ring-2 focus:ring-blue-400 ${
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

      {currentStudents.length > 0 ? (
        <ul className="space-y-3 sm:space-y-4">
          {currentStudents.map((data, index) => {
            const { student, scoreData, voteData } = data;
            const overallIndex = sortedStudents.findIndex(s => s.student._id === student._id);

            const qnaPoints = voteData.data?.totalVotes * 5;
            const submissionPoints = !scoreData.data
              ? 0
              : scoreData.data.scores.reduce((acc, score) => acc + (score.grade || 0), 0);

            return (
              <Link
                key={student._id}
                to={userRole === "teacher" ? `/${classId}/class/students/${student._id}` : null}
                className="block"
              >
                <motion.li
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  }}
                  className={`flex flex-wrap justify-between items-center p-3 sm:p-5 rounded-lg shadow transition-shadow duration-200 ${
                    mode === "light"
                      ? "bg-gradient-to-r from-purple-100 via-indigo-100 to-indigo-50"
                      : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500"
                  }`}
                >
                  <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                    {sortBy === "points" && (
                      <motion.div
                        className="mr-2 sm:mr-4 text-2xl sm:text-3xl"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        {getMedalEmoji(overallIndex)}
                      </motion.div>
                    )}
                    <div className="flex-grow sm:flex-grow-0">
                      <p
                        className="text-lg sm:text-xl font-semibold"
                        style={{
                          fontSize:
                            student.username.length > 20 ? "0.9rem" : "1.1rem",
                          maxWidth: "180px",
                          wordBreak: "break-word",
                          lineHeight: "1.2",
                        }}
                      >
                        {student.username}
                      </p>
                      {userRole === "teacher" && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {sortBy === "points" && (
                    <div className="text-base sm:text-lg font-bold w-full sm:w-auto text-right">
                      {student.totalPointsEarned + submissionPoints + qnaPoints}{" "}
                      Points
                    </div>
                  )}
                </motion.li>
              </Link>
            );
          })}
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

      <div className="mt-8 flex flex-wrap justify-center items-center space-x-6 sm:space-x-4 space-y-2 sm:space-y-0">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold transition-colors duration-200 hover:bg-blue-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold transition-colors duration-200 hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaderboardStudents;
