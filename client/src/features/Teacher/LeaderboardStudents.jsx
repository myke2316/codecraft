import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetScoreByStudentIdQuery } from "../Class/submissionAssignmentService";
import { useGetUserVoteQuery } from "../QnA/questionService";

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


  const scoresData = students.map((student) => ({
    id: student._id,
    ...useGetScoreByStudentIdQuery(student._id).data,
  }));

  const votesData = students.map((student) => ({
    id: student._id,
    ...useGetUserVoteQuery({ userId: student._id }).data,
  }));
  // Sort students by total points earned or alphabetically
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (sortBy === "points") {
        const scoresDataA = scoresData.find((item) => item.id === a._id);
        const userVoteA = votesData.find((item) => item.id === a._id);
        const qnaPointsA = (userVoteA?.totalVotes || 0) * 5;
        const submissionPointsA =
          scoresDataA?.scores?.reduce((acc, score) => acc + (score.grade || 0), 0) || 0;
        const totalPointsA = (a.totalPointsEarned || 0) + qnaPointsA + submissionPointsA;

        const scoresDataB = scoresData.find((item) => item.id === b._id);
        const userVoteB = votesData.find((item) => item.id === b._id);
        const qnaPointsB = (userVoteB?.totalVotes || 0) * 5;
        const submissionPointsB =
          scoresDataB?.scores?.reduce((acc, score) => acc + (score.grade || 0), 0) || 0;
        const totalPointsB = (b.totalPointsEarned || 0) + qnaPointsB + submissionPointsB;

        return totalPointsB - totalPointsA;
      } else if (sortBy === "name") {
        return a.username.localeCompare(b.username);
      }
      return 0;
    });
  }, [students, sortBy, scoresData, votesData]);

  return (
    <div
      className={`${
        mode === "light" ? "bg-white text-gray-900" : "text-white"
      } p-6 rounded-lg shadow-md transition-colors duration-300`}
    >
      <h2 className="text-2xl font-semibold mb-4">Students</h2>

      {/* Sort options */}
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
          {sortedStudents.map((student, index) => {
            const studentId = student._id
            
            const { data: scoresData, isFetching } = useGetScoreByStudentIdQuery(studentId);
            const { data: userVote, refetch: refetchVotes } = useGetUserVoteQuery({
              userId: studentId
            });
          
            const qnaPoints = userVote?.totalVotes * 5
            console.log(userVote?.totalVotes,qnaPoints)
       
            const submissionPoints = !scoresData ? 0 : scoresData?.scores.reduce((acc, score) => {
              return acc + (score.grade || 0);
            }, 0);
            
            return (
              <Link
                key={student._id}
                to={
                  userRole === "teacher"
                    ? `/${classId}/class/students/${student._id}`
                    : null
                }
                className="block"
              >
                <motion.li
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  }}
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
                      {userRole === "teacher" ? (
                        <p className="text-sm">{student.email}</p>
                      ) : null}
                    </div>
                  </div>
                  {/* Conditionally render points based on sorting */}
                  {sortBy === "points" && (
                    <div className="text-lg font-bold">
                      {student.totalPointsEarned + submissionPoints + qnaPoints } Points
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
    </div>
  );
};

export default LeaderboardStudents;
