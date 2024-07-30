import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import activities from "./activity.json"; // Import your JSON file
import Sidebar from "./Sidebar";
import CodingActivity from "./CodingActivity";
import OutputPanel from "./OutputPanel";
import axios from "axios";

const ActivityPage = () => {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch activity details if not already available
    const fetchActivity = () => {
      const fetchedActivity = activities.find(
        (act) => act.activityId === activityId
      );
      if (fetchedActivity) {
        setActivity(fetchedActivity);
      } else {
        setActivity(null);
      }
      setLoading(false);
    };

    fetchActivity();
  }, [activityId]);

  const handleRunCode = async (htmlCode, cssCode, jsCode) => {
    console.log(activity.language.toLowerCase())
    try {
      const response = await axios.post("http://localhost:8000/execute", {
        language: activity.language.toLowerCase(),
        html: htmlCode || "", // Send empty string if htmlCode is undefined or null
        css: cssCode || "", // Send empty string if cssCode is undefined or null
        js: jsCode || "", // Send empty string if jsCode is undefined or null
      });
  
      const output = response.data.output || "No output returned"; // Fallback message if output is undefined
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
      <Sidebar activities={activities} selectedActivity={activity} />
      {activity ? (
        <>
          <CodingActivity activity={activity} onRunCode={handleRunCode} />
          <OutputPanel output={output} activity={activity} />
        </>
      ) : (
        <div style={{ padding: "20px" }}>Activity not found</div>
      )}
    </div>
  );
};

export default ActivityPage;
