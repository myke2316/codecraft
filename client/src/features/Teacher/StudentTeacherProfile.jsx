import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchUserProgressMutation } from "../Student/studentCourseProgressService";
import { useFetchUserAnalyticsMutation } from "../Student/userAnalyticsService";
import { Container, Typography } from "@mui/material";
import TeacherStudentDashboard from "./Dashboard/TeacherStudentDashboard";


function StudentTeacherProfile() {
  const { classId, studentId } = useParams();
  const [fetchUserAnalytics] = useFetchUserAnalyticsMutation();
  const [fetchUserProgress] = useFetchUserProgressMutation();
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    console.log(studentId)
    const fetchData = async () => {
      try {
        const analyticsResponse = await fetchUserAnalytics({ userId: studentId }).unwrap();
        const progressResponse = await fetchUserProgress({ userId: studentId }).unwrap();
        setAnalytics(analyticsResponse);
        setProgress(progressResponse);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, fetchUserAnalytics, fetchUserProgress]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
  
      <Container>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <TeacherStudentDashboard userAnalytics={analytics} userProgress={progress} />
    </Container>
    
  );
}

export default StudentTeacherProfile;
