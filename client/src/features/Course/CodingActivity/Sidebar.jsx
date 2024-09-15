// import React from "react";
// import {
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Typography,
//   Box,
// } from "@mui/material";
// import { Link, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";

// const Sidebar = ({ courseId, lessonId, userProgress }) => {
//   const course = useSelector((state) => state.course.courseData);

//   // Find the specific course and lesson
//   const selectedCourse = course.find((c) => c._id === courseId);
//   const selectedLesson = selectedCourse?.lessons.find(
//     (lesson) => lesson._id === lessonId
//   );



//   // Find the progress for the selected course and lesson
//   const courseProgress = userProgress.coursesProgress.find(
//     (cp) => cp.courseId === courseId
//   );
//   const lessonProgress = courseProgress?.lessonsProgress.find(
//     (lp) => lp.lessonId === lessonId
//   );

//   return (
//     <div
//       style={{
//         width: "300px",
//         padding: "10px",
//         backgroundColor: "#f4f4f4",
//         height: "100vh",
//       }}
//     >
//       <h2>{selectedLesson?.title} Activities:</h2>
//       <List>
//         {selectedLesson?.activities.map((activity) => {
//           const activityProgress = lessonProgress?.activitiesProgress.find(
//             (ap) => ap.activityId === activity._id
//           );
//           const isLocked = activityProgress?.locked;

//           return (
//             <Link
//               to={
//                 isLocked
//                   ? "#"
//                   : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`
//               }
//               key={activity._id}
//               style={{ textDecoration: "none", color: "inherit" }}
//             >
//               <ListItem
//                 button
//                 selected={activity._id === useParams().activityId}
//                 disabled={isLocked}
//               >
//                 <ListItemText primary={activity.title} />
//               </ListItem>
//             </Link>
//           );
//         })}
//       </List>
//       <Divider />
//       {selectedLesson && (
//         <Box sx={{ padding: "10px" }}>
//           <Typography variant="h6">Lesson Details</Typography>
//           <Typography variant="body2" sx={{ marginBottom: "10px" }}>
//             <strong>Title:</strong> {selectedLesson.title}
//             <br /> <strong>Description:</strong>
//             <br />
//           </Typography>
//         </Box>
//       )}


//     </div>
//   );
// };

// export default Sidebar;



import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Tooltip, Card, List, ListItem, Typography, Divider, Box, Zoom, CardMedia, CardContent, Grid } from "@mui/material";

export default function Sidebar({ courseId, lessonId, userProgress }) {
  const course = useSelector((state) => state.course.courseData);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { activityId } = useParams();

  const selectedCourse = course.find((c) => c._id === courseId);
  const selectedLesson = selectedCourse?.lessons.find(
    (lesson) => lesson._id === lessonId
  );
  const selectedActivity = selectedLesson?.activities.find(
    (activity) => activity._id === activityId
  );

  const courseProgress = userProgress.coursesProgress.find(
    (cp) => cp.courseId === courseId
  );
  const lessonProgress = courseProgress?.lessonsProgress.find(
    (lp) => lp.lessonId === lessonId
  );

  const testCases = selectedActivity?.testCases || [];

  return (
    <div
      style={{
        width: "300px",
        padding: "16px",
        backgroundColor: "#f8fafc",
        height: "100vh",
        overflowY: "auto",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {selectedLesson?.title} Activities:
      </Typography>
      
      <List>
        {selectedLesson?.activities.map((activity) => {
          const activityProgress = lessonProgress?.activitiesProgress.find(
            (ap) => ap.activityId === activity._id
          );
          const isLocked = activityProgress?.locked;

          return (
            <Link
              to={
                isLocked
                  ? "#"
                  : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`
              }
              key={activity._id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem
                button
                selected={activity._id === activityId}
                disabled={isLocked}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: "8px",
                  bgcolor: activity._id === activityId ? "#1976d2" : "#f5f5f5",
                  color: activity._id === activityId ? "#ffffff" : "#000000",
                  '&:hover': {
                    bgcolor: "#e0e0e0",
                  },
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                <Typography variant="body1">{activity.title}</Typography>
              </ListItem>
            </Link>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {testCases.length > 0 && (
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Test Cases
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {testCases.map((testCase, testCaseIndex) => (
              <React.Fragment key={testCaseIndex}>
                {testCase.testCaseSentences.map((sentence, sentenceIndex) => (
                  <Tooltip
                    key={`${testCaseIndex}-${sentenceIndex}`}
                    title={<Typography>{sentence}</Typography>}
                    arrow
                  >
                    <Card
                      sx={{
                        p: 2,
                        bgcolor: testCase.isHidden ? "#e0e0e0" : "#ffffff",
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredCard(`${testCaseIndex}-${sentenceIndex}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <Typography variant="body2">
                        Test Case {testCaseIndex + 1}.{sentenceIndex + 1}
                      </Typography>
                    </Card>
                  </Tooltip>
                ))}
                
                {/* Expected Output Image Section */}
                {testCase.expectedImage && (
                  <Grid item xs={12} key={`${testCaseIndex}-image`} sx={{ mt: 2 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>Expected Output Image:</strong>
                        </Typography>
                        <Zoom in={true}>
                          <CardMedia
                            component="img"
                            image={testCase.expectedImage}
                            alt="Expected Output"
                            sx={{
                              borderRadius: 2,
                              maxWidth: "100%",
                              maxHeight: 400,
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              mt: 2,
                              cursor: "pointer",
                            }}
                          />
                        </Zoom>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
}


