
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import CodingActivity from "./CodingActivity";
import OutputPanel from "./OutputPanel";
import axios from "axios";
import { BACKEND_URL } from "../../../constants";

const ActivityPage = () => {
  const { courseId, lessonId, activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);

  const course = useSelector(state => state.course.courseData);
  const userProgress = useSelector(state => state.studentProgress.userProgress);

  useEffect(() => {
    const fetchActivity = () => {
      const selectedCourse = course.find(c => c._id === courseId);
      const selectedLesson = selectedCourse?.lessons.find(lesson => lesson._id === lessonId);
      const selectedActivity = selectedLesson?.activities.find(act => act._id === activityId);
      setActivity(selectedActivity);
      setLoading(false);
    };

    fetchActivity();
  }, [activityId, course, courseId, lessonId]);

  const handleRunCode = async (htmlCode, cssCode, jsCode) => {
    if (!activity) {
      setOutput("No activity loaded");
      return;
    }

    try {
      
      const response = await axios.post(`${BACKEND_URL}/execute`, {
        language: activity.language.toLowerCase(),
        html: htmlCode || "",
        css: cssCode || "",
        js: jsCode || "",
      });

      const output = response.data.output || "No output returned";
      setOutput(output);
      
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar courseId={courseId} lessonId={lessonId} userProgress={userProgress} />
      {activity ? (
        <>
          <CodingActivity activity={activity} onRunCode={handleRunCode} output={output} setOutput={setOutput}/>
          {/* <OutputPanel output={output} activity={activity} onRunCode={handleRunCode}/> */}
        </>
      ) : (
        <div style={{ padding: "20px" }}>Activity not found</div>
      )}
    </div>
  );
};

export default ActivityPage;
