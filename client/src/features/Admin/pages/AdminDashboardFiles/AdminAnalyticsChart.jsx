// AdminAnalyticsChart.js
import { useMemo } from "react";

import PieChartCompletion from "./PieChartCompletion";
import ActiveUsersChart from "./ActiveUsersChart";
import CourseActiveChart from "./CourseActiveChart";
import AverageTimeSpentChart from "./AverageTimeSpentChart";
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from "@mui/material";

function AdminAnalyticsChart({
  userAnalytics,
  classesData,
  userProgress,
  users,
}) {
  console.log("User Analytics", userAnalytics);
  console.log("Classes Data", classesData);
  console.log("User Progress", userProgress);
  console.log("Users", users);

  //Pie Chart Completion Data

  // const courseCompletionData = useMemo(() => {
  //   const completed = users?.filter((user) => user.courseCompleted).length;
  //   const notCompleted = users?.length - completed;
  //   return [
  //     { name: "Completed", value: completed },
  //     { name: "Not Completed", value: notCompleted },
  //   ];
  // }, [users]);

  //handles empty user
  const courseCompletionData = useMemo(() => {
    // Check for empty or undefined users
    if (!users || users.length === 0) {
      return [
        { name: "Completed", value: 0 },
        { name: "Not Completed", value: 0 },
      ]; // Return zero for both categories if there are no users
    }
  
    const completed = users.filter((user) => user.courseCompleted).length;
    const notCompleted = users.length - completed;
  
    return [
      { name: "Completed", value: completed },
      { name: "Not Completed", value: notCompleted },
    ];
  }, [users]);

  // Active Users Chart for the last 7 days
  // const activeUsersData = useMemo(() => {
  //   // Find the earliest date from the userProgress data
  //   const allDates = userProgress.flatMap(up =>
  //     up.coursesProgress.flatMap(course => {
  //       const finishedDates = [
  //         ...course.dateFinished ? [new Date(course.dateFinished)] : [],
  //         ...course.lessonsProgress.flatMap(lesson => {
  //           const lessonFinishedDates = [
  //             ...lesson.dateFinished ? [new Date(lesson.dateFinished)] : [],
  //             ...lesson.documentsProgress.flatMap(doc =>
  //               doc.dateFinished ? [new Date(doc.dateFinished)] : []
  //             ),
  //             ...lesson.quizzesProgress.flatMap(quiz =>
  //               quiz.dateFinished ? [new Date(quiz.dateFinished)] : []
  //             ),
  //             ...lesson.activitiesProgress.flatMap(activity =>
  //               activity.dateFinished ? [new Date(activity.dateFinished)] : []
  //             ),
  //           ];
  //           return lessonFinishedDates;
  //         }),
  //       ];
  //       return finishedDates;
  //     })
  //   );
  
  //   const earliestDate = new Date(Math.min(...allDates)); // Get the earliest date
  //   const daysData = [];
  //   const totalDays = 7; // Number of days to look back
  
  //   for (let i = 0; i < totalDays; i++) {
  //     // Loop for the last 30 days
  //     const date = new Date(earliestDate);
  //     date.setDate(earliestDate.getDate() + i); // Increment date by i
  //     const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  
  //     const activeUsersSet = new Set(); // To store unique user IDs
  
  //     users.forEach((user) => {
  //       const userProgressEntry = userProgress.find(
  //         (up) => up.userId.toString() === user._id.toString()
  //       );
  
  //       if (userProgressEntry) {
  //         // Check courses progress for any dateFinished
  //         userProgressEntry.coursesProgress.forEach((course) => {
  //           if (course.dateFinished) {
  //             const courseDate = new Date(course.dateFinished)
  //               .toISOString()
  //               .split("T")[0]; // Extract date only
  //             if (courseDate === formattedDate) {
  //               activeUsersSet.add(user._id); // Add user ID to the set
  //             }
  //           }
  
  //           // Check lessons progress for any lesson's dateFinished
  //           course.lessonsProgress.forEach((lesson) => {
  //             if (lesson.dateFinished) {
  //               const lessonDate = new Date(lesson.dateFinished)
  //                 .toISOString()
  //                 .split("T")[0]; // Extract date only
  //               if (lessonDate === formattedDate) {
  //                 activeUsersSet.add(user._id); // Add user ID to the set
  //               }
  //             }
  
  //             // Check document progress
  //             lesson.documentsProgress.forEach((document) => {
  //               if (document.dateFinished) {
  //                 const documentDate = new Date(document.dateFinished)
  //                   .toISOString()
  //                   .split("T")[0]; // Extract date only
  //                 if (documentDate === formattedDate) {
  //                   activeUsersSet.add(user._id); // Add user ID to the set
  //                 }
  //               }
  //             });
  
  //             // Check quiz progress
  //             lesson?.quizzesProgress.forEach((quiz) => {
  //               if (quiz.dateFinished) {
  //                 const quizDate = new Date(quiz.dateFinished)
  //                   .toISOString()
  //                   .split("T")[0]; // Extract date only
  //                 if (quizDate === formattedDate) {
  //                   activeUsersSet.add(user._id); // Add user ID to the set
  //                 }
  //               }
  //             });
  
  //             // Check activity progress
  //             lesson?.activitiesProgress.forEach((activity) => {
  //               if (activity.dateFinished) {
  //                 const activityDate = new Date(activity.dateFinished)
  //                   .toISOString()
  //                   .split("T")[0]; // Extract date only
  //                 if (activityDate === formattedDate) {
  //                   activeUsersSet.add(user._id); // Add user ID to the set
  //                 }
  //               }
  //             });
  //           });
  //         });
  //       }
  //     });
  
  //     // Count unique active users
  //     const activeCount = activeUsersSet.size;
  //     daysData.push({ date: formattedDate, activeUsers: activeCount }); // Add date and active count
  //   }
  
  //   // console.log("Active Users Data:", JSON.stringify(daysData, null, 2)); // Enhanced logging
  //   return daysData;
  // }, [users, userProgress]);
  
  //handles no userProgress, or empty
  const activeUsersData = useMemo(() => {
    // Check for empty users or userProgress
    if (!users || !userProgress) {
      return []; // Return empty array if there are no users or user progress entries
    }
  
    // Find the earliest date from the userProgress data
    const allDates = userProgress.flatMap(up =>
      up.coursesProgress.flatMap(course => {
        const finishedDates = [
          ...course.dateFinished ? [new Date(course.dateFinished)] : [],
          ...course.lessonsProgress.flatMap(lesson => {
            const lessonFinishedDates = [
              ...lesson.dateFinished ? [new Date(lesson.dateFinished)] : [],
              ...lesson.documentsProgress.flatMap(doc =>
                doc.dateFinished ? [new Date(doc.dateFinished)] : []
              ),
              ...lesson.quizzesProgress.flatMap(quiz =>
                quiz.dateFinished ? [new Date(quiz.dateFinished)] : []
              ),
              ...lesson.activitiesProgress.flatMap(activity =>
                activity.dateFinished ? [new Date(activity.dateFinished)] : []
              ),
            ];
            return lessonFinishedDates;
          }),
        ];
        return finishedDates;
      })
    );
  
    // Handle case where allDates is empty
    if (allDates.length === 0) {
      return []; // Return empty array if no finished dates are found
    }
  
    const earliestDate = new Date(Math.min(...allDates)); // Get the earliest date
    const daysData = [];
    const totalDays = 7; // Number of days to look back
  
    for (let i = 0; i < totalDays; i++) {
      // Loop for the last 7 days
      const date = new Date(earliestDate);
      date.setDate(earliestDate.getDate() + i); // Increment date by i
      const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  
      const activeUsersSet = new Set(); // To store unique user IDs
  
      users.forEach((user) => {
        const userProgressEntry = userProgress.find(
          (up) => up.userId.toString() === user._id.toString()
        );
  
        if (userProgressEntry) {
          // Check courses progress for any dateFinished
          userProgressEntry.coursesProgress.forEach((course) => {
            if (course.dateFinished) {
              const courseDate = new Date(course.dateFinished)
                .toISOString()
                .split("T")[0]; // Extract date only
              if (courseDate === formattedDate) {
                activeUsersSet.add(user._id); // Add user ID to the set
              }
            }
  
            // Check lessons progress for any lesson's dateFinished
            course.lessonsProgress.forEach((lesson) => {
              if (lesson.dateFinished) {
                const lessonDate = new Date(lesson.dateFinished)
                  .toISOString()
                  .split("T")[0]; // Extract date only
                if (lessonDate === formattedDate) {
                  activeUsersSet.add(user._id); // Add user ID to the set
                }
              }
  
              // Check document progress
              lesson.documentsProgress.forEach((document) => {
                if (document.dateFinished) {
                  const documentDate = new Date(document.dateFinished)
                    .toISOString()
                    .split("T")[0]; // Extract date only
                  if (documentDate === formattedDate) {
                    activeUsersSet.add(user._id); // Add user ID to the set
                  }
                }
              });
  
              // Check quiz progress
              lesson?.quizzesProgress.forEach((quiz) => {
                if (quiz.dateFinished) {
                  const quizDate = new Date(quiz.dateFinished)
                    .toISOString()
                    .split("T")[0]; // Extract date only
                  if (quizDate === formattedDate) {
                    activeUsersSet.add(user._id); // Add user ID to the set
                  }
                }
              });
  
              // Check activity progress
              lesson?.activitiesProgress.forEach((activity) => {
                if (activity.dateFinished) {
                  const activityDate = new Date(activity.dateFinished)
                    .toISOString()
                    .split("T")[0]; // Extract date only
                  if (activityDate === formattedDate) {
                    activeUsersSet.add(user._id); // Add user ID to the set
                  }
                }
              });
            });
          });
        }
      });
  
      // Count unique active users
      const activeCount = activeUsersSet.size;
      daysData.push({ date: formattedDate, activeUsers: activeCount }); // Add date and active count
    }
  
    // console.log("Active Users Data:", JSON.stringify(daysData, null, 2)); // Enhanced logging
    return daysData;
  }, [users, userProgress]);
  


  //Course Active Chart
  // const activeUsersPerCourse = useMemo(() => {
  //   const courseActiveUsersMap = {}; // To store active users per course

  //   users.forEach((user) => {
  //     const userProgressEntry = userProgress.find(
  //       (up) => up.userId.toString() === user._id.toString()
  //     );

  //     if (userProgressEntry) {
  //       // Flag to track whether the user has been marked as active in a course
  //       let userIsActiveInACourse = false;

  //       // Iterate through coursesProgress to find the first incomplete course
  //       userProgressEntry.coursesProgress.forEach((courseProgress) => {
  //         if (userIsActiveInACourse) return; // If already active in a previous course, skip further processing

  //         const courseId = courseProgress.courseId.toString();

  //         // Initialize course in the map if not already present
  //         if (!courseActiveUsersMap[courseId]) {
  //           courseActiveUsersMap[courseId] = [];
  //         }

  //         // Check if the user has unfinished work in this course
  //         let hasUnfinishedItems = false;

  //         // Check lessons
  //         courseProgress.lessonsProgress.forEach((lesson) => {
  //           if (!lesson.dateFinished) hasUnfinishedItems = true;

  //           // Check documents
  //           lesson.documentsProgress.forEach((document) => {
  //             if (!document.dateFinished) hasUnfinishedItems = true;
  //           });

  //           // Check quizzes
  //           lesson.quizzesProgress.forEach((quiz) => {
  //             if (!quiz.dateFinished) hasUnfinishedItems = true;
  //           });

  //           // Check activities
  //           lesson.activitiesProgress.forEach((activity) => {
  //             if (!activity.dateFinished) hasUnfinishedItems = true;
  //           });
  //         });

  //         // If the user has unfinished work in this course, they are active in this course
  //         if (hasUnfinishedItems) {
  //           courseActiveUsersMap[courseId].push(user._id); // Add user to the course
  //           userIsActiveInACourse = true; // Mark the user as active in this course
  //         }
  //       });
  //     }
  //   });

  //   // Convert the map into an array for easier consumption
  //   const activeUsersData = Object.keys(courseActiveUsersMap).map(
  //     (courseId) => ({
  //       courseId,
  //       activeUsers: courseActiveUsersMap[courseId],
  //     })
  //   );

  //   // console.log("Active Users Per Course (User IDs):", JSON.stringify(activeUsersData, null, 2));
  //   return activeUsersData;
  // }, [users, userProgress]);

  //handles no userProgress or empty
  const activeUsersPerCourse = useMemo(() => {
    // Check for empty users or userProgress
    if (!users || !userProgress) {
      return []; // Return empty array if there are no users or user progress entries
    }
  
    const courseActiveUsersMap = {}; // To store active users per course
  
    users.forEach((user) => {
      const userProgressEntry = userProgress.find(
        (up) => up.userId.toString() === user._id.toString()
      );
  
      if (userProgressEntry) {
        // Flag to track whether the user has been marked as active in a course
        let userIsActiveInACourse = false;
  
        // Iterate through coursesProgress to find the first incomplete course
        userProgressEntry.coursesProgress.forEach((courseProgress) => {
          if (userIsActiveInACourse) return; // If already active in a previous course, skip further processing
  
          const courseId = courseProgress.courseId.toString();
  
          // Initialize course in the map if not already present
          if (!courseActiveUsersMap[courseId]) {
            courseActiveUsersMap[courseId] = [];
          }
  
          // Check if the user has unfinished work in this course
          let hasUnfinishedItems = false;
  
          // Check lessons
          courseProgress.lessonsProgress.forEach((lesson) => {
            if (!lesson.dateFinished) hasUnfinishedItems = true;
  
            // Check documents
            lesson.documentsProgress.forEach((document) => {
              if (!document.dateFinished) hasUnfinishedItems = true;
            });
  
            // Check quizzes
            lesson.quizzesProgress.forEach((quiz) => {
              if (!quiz.dateFinished) hasUnfinishedItems = true;
            });
  
            // Check activities
            lesson.activitiesProgress.forEach((activity) => {
              if (!activity.dateFinished) hasUnfinishedItems = true;
            });
          });
  
          // If the user has unfinished work in this course, they are active in this course
          if (hasUnfinishedItems) {
            courseActiveUsersMap[courseId].push(user._id); // Add user to the course
            userIsActiveInACourse = true; // Mark the user as active in this course
          }
        });
      }
    });
  
    // Convert the map into an array for easier consumption
    const activeUsersData = Object.keys(courseActiveUsersMap).map(
      (courseId) => ({
        courseId,
        activeUsers: courseActiveUsersMap[courseId],
      })
    );
  
    // console.log("Active Users Per Course (User IDs):", JSON.stringify(activeUsersData, null, 2));
    return activeUsersData;
  }, [users, userProgress]);
  

  return (
<Container maxWidth={false} className="p-6 bg-gray-100">
<Box 
                  sx={{ 
                    width: '100%', 
                    height: '90px', 
                    backgroundColor: 'rgb(110, 97, 171)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: "10px",
                    borderRadius: "3px"
                  }}
                >
    <Typography variant="h4" component="h1" className="mb-6 text-white-800 font-bold"   sx={{ color: 'white' }}>
    Admin Analytics Dashboard
    </Typography>
  </Box>
  
 
  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Paper elevation={3} className="p-4 h-full">
        <Typography variant="h5" className="mb-6 text-black-800 font-bold" sx={{textAlign: "center"}}>
          Course Completion Overview
        </Typography>
        <Box className="h-64">
          <PieChartCompletion data={courseCompletionData} />
        </Box>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper elevation={3} className="p-4">
      <Typography variant="h5" className="mb-6 text-black-800 font-bold" sx={{textAlign: "center"}}>
          Users Per Course
        </Typography>
        <Box className="h-[400px]">
          <CourseActiveChart activeUsersPerCourse={activeUsersPerCourse} />
        </Box>
      </Paper>
    </Grid>
    <Grid item xs={12}>
      <Paper elevation={3} className="p-4">
      <Box 
                  sx={{ 
                    width: '100%', 
                    height: '80px', 
                    backgroundColor: 'rgb(110, 97, 171)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: "10px",
                    borderRadius: "3px"
                  }}
                >

    <Typography variant="h5" gutterBottom className="mb-6 text-black-800 font-bold"   sx={{ color: 'white' }}>
         Average Users Overtime
        </Typography>
              </Box>
        <Box className="h-[500px]">
          <ActiveUsersChart data={activeUsersData} />
        </Box>
      </Paper>
    </Grid>
    <Grid item xs={12}>
      <Paper elevation={3} className="p-4">
      <Box 
                  sx={{ 
                    width: '100%', 
                    height: '80px', 
                    backgroundColor: 'rgb(110, 97, 171)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: "10px",
                    borderRadius: "3px"
                  }}
                >

    <Typography variant="h5" gutterBottom className="mb-6 text-black-800 font-bold"   sx={{ color: 'white' }}>
         Average Time Spent Per Course
        </Typography>
        </Box>
        <Box className="h-[400px]">
          <AverageTimeSpentChart userAnalytics={userAnalytics} />
        </Box>
      </Paper>
    </Grid>
  </Grid>
</Container>
  );
}

export default AdminAnalyticsChart;
