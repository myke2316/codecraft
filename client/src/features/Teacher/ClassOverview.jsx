import { formatTime } from "../../utils/formatTime";

function ClassOverview({ averagePoints, averageTimeSpent, students }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 border border-gray-300 mb-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        Class Overview
      </h2>
      <div className="grid grid-cols-3 gap-6 text-center">
        {/* Average Points */}
        <div>
          <p className="text-lg font-medium text-gray-600">
            Average Points Earned
          </p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {averagePoints.toFixed(2)}
          </p>
        </div>

        {/* Total Students */}
        <div>
          <p className="text-lg font-medium text-gray-600">Total Students</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {students.length}
          </p>
        </div>

        {/* Average Time Spent */}
        <div>
          <p className="text-lg font-medium text-gray-600">
            Average Time Spent
          </p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {formatTime(averageTimeSpent)}
          </p>
        </div>
      </div>
    </div>
  );
}
export default ClassOverview;
