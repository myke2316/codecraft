import React, { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  School,
  MenuBook,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description,
  Quiz as QuizIcon,
  Code,
  Menu as MenuIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { 
  useGetCourseDataQQuery, 
  useUpdateCourseTitleMutation,
  useUpdateLessonTitleMutation
} from "../../Class/courseService";
import CmsEditDocument from "./CmsEditDocument";
import CmsEditQuiz from "./CmsEditQuiz";
import CmsEditActivity from "./CmsEditActivity";

export default function CmsLayout() {
  const [expandedCourses, setExpandedCourses] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { data: courses, isLoading, error, refetch } = useGetCourseDataQQuery();
  const [updateCourseTitle] = useUpdateCourseTitleMutation();
  const [updateLessonTitle] = useUpdateLessonTitleMutation();

  function handleEditItem(item, type, courseId, lessonId) {
    if (type === "document") {
      setEditingDocument(item);
      setCurrentCourseId(courseId);
      setCurrentLessonId(lessonId);
    } else if (type === "quiz") {
      setEditingQuiz(item);
      setCurrentCourseId(courseId);
      setCurrentLessonId(lessonId);
    } else if (type === "activity") {
      setEditingActivity(item);
      setCurrentCourseId(courseId);
      setCurrentLessonId(lessonId);
    } else if (type === "course" || type === "lesson") {
      setEditingTitle({ type, id: type === "course" ? courseId : lessonId, courseId });
      setNewTitle(item.title);
    } else {
      console.log(item, type);
    }
  }

  const handleSaveTitle = async () => {
    try {
      if (editingTitle.type === "course") {
        await updateCourseTitle({ courseId: editingTitle.id, title: newTitle }).unwrap();
      } else if (editingTitle.type === "lesson") {
        await updateLessonTitle({ 
          courseId: editingTitle.courseId, 
          lessonId: editingTitle.id, 
          title: newTitle 
        }).unwrap();
      }
      refetch();
      setEditingTitle(null);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const handleItemClick = (item, courseId) => {
    setSelectedItem(item);
    setCurrentCourseId(courseId);
    setCurrentLessonId(item._id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDocumentSave = (updatedDocument) => {
    setSelectedItem((prevItem) => ({
      ...prevItem,
      documents: prevItem.documents.map((doc) =>
        doc._id === updatedDocument._id ? updatedDocument : doc
      ),
    }));
    refetch();
    setEditingDocument(null);
  };

  const handleQuizSave = (updatedQuiz) => {
    setSelectedItem((prevItem) => ({
      ...prevItem,
      quiz: prevItem.quiz.map((q) =>
        q._id === updatedQuiz._id ? updatedQuiz : q
      ),
    }));
    refetch();
    setEditingQuiz(null);
  };

  const handleActivitySave = (updatedActivity) => {
    setSelectedItem((prevItem) => ({
      ...prevItem,
      activities: prevItem.activities.map((a) =>
        a._id === updatedActivity._id ? updatedActivity : a
      ),
    }));
    refetch();
    setEditingActivity(null);
  };

  if (isLoading) {
    return <Typography className="p-4">Loading courses...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" className="p-4">
        Error loading courses: {error.toString()}
      </Typography>
    );
  }

  const renderCourseList = () => (
    <List className="overflow-auto flex-grow">
      {courses?.map((course) => (
        <Paper key={course._id} elevation={1} className="overflow-hidden m-2">
          <ListItem
            button
            onClick={() => toggleCourse(course._id)}
            className="transition-colors duration-300 hover:bg-gray-50"
          >
            <ListItemIcon>
              <School className="text-blue-500" />
            </ListItemIcon>
            {editingTitle && editingTitle.id === course._id ? (
              <Box className="flex items-center flex-grow">
                <TextField
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-grow mr-2"
                  size="small"
                />
                <IconButton onClick={handleSaveTitle} size="small">
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => setEditingTitle(null)} size="small">
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <>
                <Tooltip title={course.title} placement="right">
                  <ListItemText
                    primary={course.title}
                    primaryTypographyProps={{
                      noWrap: true,
                      className: "font-semibold",
                    }}
                  />
                </Tooltip>
                <IconButton
                  size="small"
                  className="text-blue-500 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditItem(course, "course", course._id);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
            {expandedCourses[course._id] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse
            in={expandedCourses[course._id]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {course.lessons.map((lesson) => (
                <ListItem
                  button
                  className="pl-8 transition-colors duration-300 hover:bg-gray-100"
                  key={lesson._id}
                  onClick={() => handleItemClick(lesson, course._id)}
                >
                  <ListItemIcon>
                    <MenuBook className="text-green-500" />
                  </ListItemIcon>
                  {editingTitle && editingTitle.id === lesson._id ? (
                    <Box className="flex items-center flex-grow">
                      <TextField
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-grow mr-2"
                        size="small"
                      />
                      <IconButton onClick={handleSaveTitle} size="small">
                        <SaveIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => setEditingTitle(null)} size="small">
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Tooltip title={lesson.title} placement="right">
                        <ListItemText
                          primary={lesson.title}
                          primaryTypographyProps={{
                            noWrap: true,
                            className: "text-sm",
                          }}
                        />
                      </Tooltip>
                      <IconButton
                        size="small"
                        className="text-blue-500 mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(lesson, "lesson", course._id, lesson._id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      ))}
    </List>
  );

  const renderLessonDetails = () => (
    <Box className="p-6 overflow-auto flex-grow">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <Box className="flex items-center">
          {editingTitle && editingTitle.id === selectedItem._id ? (
            <Box className="flex items-center">
              <TextField
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mr-2"
                size="small"
              />
              <IconButton onClick={handleSaveTitle} size="small">
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => setEditingTitle(null)} size="small">
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="h5"
                className="text-gray-800 font-bold mb-2 sm:mb-0 break-words max-w-full"
              >
                {selectedItem.title}
              </Typography>
              <IconButton
                size="small"
                className="text-blue-500 ml-2"
                onClick={() => handleEditItem(selectedItem, "lesson", currentCourseId, selectedItem._id)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={isEditMode ? null : <EditIcon />}
          className={`${
            isEditMode
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white mt-2 sm:mt-0`}
          onClick={toggleEditMode}
        >
          {isEditMode ? "Cancel Edit" : "Edit Lesson"}
        </Button>
      </Box>
      <Divider className="mb-4" />

      <Typography
        variant="h6"
        className="mt-6 mb-2 text-gray-700 font-semibold"
      >
        Lesson Contents:
      </Typography>
      <List> 
        {selectedItem.documents?.map((doc, index) => (
          <ListItem
            key={index}
            className="bg-gray-50 rounded-md mb-2 flex-wrap"
          >
            <ListItemIcon>
              <Description className="text-blue-400" />
            </ListItemIcon>
            <ListItemText
              primary={doc.title}
              secondary="Document"
              primaryTypographyProps={{ className: "font-medium break-words" }}
              className="whitespace-normal flex-grow"
            />
           
            {isEditMode && (
              <Box className="flex items-center ml-2">
                <IconButton size="small" className="text-blue-500">
                  <EditIcon onClick={() => handleEditItem(doc, "document", currentCourseId, selectedItem._id)} fontSize="small" />
                </IconButton>
                <IconButton size="small" className="text-red-500">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </ListItem>
        ))}
        {selectedItem.quiz?.map((quizItem, index) => (
          <ListItem
            key={index}
            className="bg-gray-50 rounded-md mb-2 flex-wrap"
          >
            <ListItemIcon>
              <QuizIcon className="text-yellow-400" />
            </ListItemIcon>
            <ListItemText
              primary={quizItem.question}
              secondary="Quiz"
              primaryTypographyProps={{ className: "font-medium break-words" }}
              className="whitespace-normal flex-grow"
            />
            {isEditMode && (
              <Box className="flex items-center ml-2">
                <IconButton size="small" className="text-blue-500">
                  <EditIcon onClick={() => handleEditItem(quizItem, "quiz", currentCourseId, selectedItem._id)} fontSize="small" />
                </IconButton>
                <IconButton size="small" className="text-red-500">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </ListItem>
        ))}
        {selectedItem.activities?.map((activity, index) => (
          <ListItem
            key={index}
            className="bg-gray-50 rounded-md mb-2 flex-wrap"
          >
            <ListItemIcon>
              <Code className="text-green-400" />
            </ListItemIcon>
            <ListItemText
              primary={activity.title}
              secondary="Activity"
              primaryTypographyProps={{ className: "font-medium break-words" }}
              className="whitespace-normal flex-grow"
            />
            {isEditMode && (
              <Box className="flex items-center ml-2">
                <IconButton size="small" className="text-blue-500">
                  <EditIcon onClick={() => handleEditItem(activity, "activity", currentCourseId, selectedItem._id)} fontSize="small" />
                </IconButton>
                <IconButton size="small" className="text-red-500">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box className="flex h-full bg-gray-100" sx={{ height: "100%" }}>
      <Paper elevation={3} className="flex-grow bg-white overflow-hidden">
        <Box className="h-full flex flex-col">
          <Box className="flex items-center justify-between p-4">
            <Typography
              variant="h4"
              className="text-gray-800 font-bold truncate flex-grow pl-5"
            >
              Course Management
            </Typography>
            {isMobile && (
              <IconButton onClick={toggleSidebar} className="ml-2">
                <MenuIcon />
              </IconButton>
            )}
          </Box>
          <Box className="flex flex-grow overflow-hidden">
            {(!isMobile || sidebarOpen) && (
              <Box
                className={`${
                  isMobile ? "absolute inset-y-0 left-0 z-50" : "relative"
                } w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 overflow-hidden flex flex-col bg-white`}
              >
                {renderCourseList()}
              </Box>
            )}
            <Box
              className={`${
                isMobile ? "w-full" : "w-2/3 lg:w-3/4"
              } overflow-hidden flex flex-col`}
            >
              {selectedItem ? (
                renderLessonDetails()
              ) : (
                <Box className="h-full flex items-center justify-center">
                  <Typography
                    variant="h6"
                    className="text-gray-400 text-center px-4"
                  >
                    Select a lesson from the list to view details
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
  
      <CmsEditDocument
        open={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        document={editingDocument}
        courseId={currentCourseId}
        lessonId={currentLessonId}
        onSave={handleDocumentSave}
      />
      <CmsEditQuiz
        open={!!editingQuiz}
        onClose={() => setEditingQuiz(null)}
        quiz={editingQuiz}
        courseId={currentCourseId}
        lessonId={currentLessonId}
        onSave={handleQuizSave}
      />
     
      <CmsEditActivity
        open={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        activity={editingActivity}
        courseId={currentCourseId}
        lessonId={currentLessonId}
        onSave={handleActivitySave}
      />
    </Box>
  );
}