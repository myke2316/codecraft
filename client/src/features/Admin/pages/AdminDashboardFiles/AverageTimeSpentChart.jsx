import React, { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCourseDataQQuery } from '../../../Class/courseService';  // Query to fetch course titles
import { formatTime } from '../../../../utils/formatTime'; 
import { useGetAllAnalyticsMutation } from '../../../Student/userAnalyticsService';

const AverageTimeSpentChart = () => {
  // Fetch course titles
  const { data: courseData, isLoading: coursesLoading, error: courseError } = useGetCourseDataQQuery();

  // Mutation to fetch analytics data
  const [getAllAnalytics, { data: userAnalytics, isLoading: analyticsLoading, error: analyticsError }] = useGetAllAnalyticsMutation();
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    // Fetch user analytics when the component mounts
    getAllAnalytics().then((response) => {
      setAnalyticsData(response.data);
    });
  }, [getAllAnalytics]);

  // Calculate the average time spent per course
  const chartData = useMemo(() => {
    if (!courseData || !analyticsData) return [];

    const courseTimeData = {};

    // Iterate through user analytics to calculate total time per course
    analyticsData.forEach(user => {
      user.coursesAnalytics.forEach(course => {
        if (!courseTimeData[course.courseId]) {
          courseTimeData[course.courseId] = { totalTime: 0, userCount: 0 };
        }

        // Sum up totalTimeSpent for each course across all users
        courseTimeData[course.courseId].totalTime += course.totalTimeSpent;
        courseTimeData[course.courseId].userCount += 1;
      });
    });

    // Generate chart data by calculating average time spent per course
    return Object.keys(courseTimeData).map(courseId => {
      const course = courseTimeData[courseId];
      const courseTitle = courseData.find(c => c._id === courseId)?.title || `Course ${courseId}`;
      
      // Calculate average time in seconds
      const averageTimeSpentInSeconds = course.totalTime / course.userCount; 

      return {
        course: courseTitle,
        averageTimeSpent: averageTimeSpentInSeconds, // Keep as seconds for the chart
      };
    });
  }, [analyticsData, courseData]);

  if (coursesLoading || analyticsLoading) return <p>Loading...</p>;
  if (courseError || analyticsError) return <p>No Data to show</p>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis />
        <Tooltip 
          formatter={(value, name, props) => {
            // Access the relevant value directly
            const averageTimeSpent = props.active ? props.payload[0].averageTimeSpent : value;
            return [`Average Time: ${formatTime(averageTimeSpent)}`];
          }}
        />
        <Legend />
        <Bar dataKey="averageTimeSpent" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AverageTimeSpentChart;