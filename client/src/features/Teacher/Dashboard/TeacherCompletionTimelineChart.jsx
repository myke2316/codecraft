import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";
import { formatDate } from "../../../utils/formatDate";


const TeacherCompletionTimelineChart = ({userProgress}) => {
  // const userProgress = useSelector((state) => state.studentProgress.userProgress);

  // Aggregate completion data
  const completionData = [];

  userProgress.coursesProgress.forEach((course) => {
    course.lessonsProgress.forEach((lesson) => {
      lesson.documentsProgress.forEach((doc) => {
        if (!doc.locked && doc.dateFinished) {
          completionData.push({
            date: formatDate(doc.dateFinished),
            type: "Document",
          });
        }
      });

      lesson.quizzesProgress.forEach((quiz) => {
        if (!quiz.locked && quiz.dateFinished) {
          completionData.push({
            date: formatDate(quiz.dateFinished),
            type: "Quiz",
          });
        }
      });

      lesson.activitiesProgress.forEach((activity) => {
        if (!activity.locked && activity.dateFinished) {
          completionData.push({
            date: formatDate(activity.dateFinished),
            type: "Activity",
          });
        }
      });
    });
  });

  // Group data by date
  const groupedData = completionData.reduce((acc, item) => {
    const existingEntry = acc.find((entry) => entry.date === item.date);
    if (existingEntry) {
      existingEntry[item.type]++;
    } else {
      acc.push({ date: item.date, Document: 0, Quiz: 0, Activity: 0, [item.type]: 1 });
    }
    return acc;
  }, []);

  // Sort data by date
  groupedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ResponsiveContainer width="100%" height={400}>
        Completion Trends Over Time
      <LineChart
        data={groupedData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Document" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Quiz" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Activity" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TeacherCompletionTimelineChart;
