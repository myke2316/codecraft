import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const LeaderboardStudents = ({ students, classId }) => {
  const [sortBy, setSortBy] = useState("points");
  const userRole = useSelector((state) => state.user.userDetails.role);
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
    <div>
      {/* Sort options */}
      <div className="mb-4">
        <label
          htmlFor="sort-by"
          className="block text-sm font-medium text-gray-700"
        >
          Sort by:
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="points">Total Points</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Display students */}
      {sortedStudents.length > 0 ? (
        <ul className="space-y-4">
          {sortedStudents.map((student, index) => (
            <Link
              key={student._id}
              to={userRole === 'teacher' ? `/${classId}/students/${student._id}` : console.log("STUDENT PROFILE VIEW")}
              className="block"
            >
              <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <div className="flex items-center">
                  {/* Display trophy emojis based on rank */}
                  {sortBy === "points" &&
                    (index === 0 || index === 1 || index === 2) && (
                      <div className="mr-2 text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                    )}
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {student.username}
                    </p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
                {/* Conditionally render points based on sorting */}
                {sortBy === "points" && (
                  <div className="text-lg font-semibold text-gray-800">
                    {student.totalPointsEarned} Points
                  </div>
                )}
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No students have joined this class yet.</p>
      )}
    </div>
  );
};

export default LeaderboardStudents;
