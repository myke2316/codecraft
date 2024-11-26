import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';
import { useUpdateActivityMutation } from '../../Class/courseService';

export default function Component({ open, onClose, activity: initialActivity, courseId, lessonId, onSave }) {
  const [activity, setActivity] = useState(initialActivity);
  const [error, setError] = useState('');
  const [updateActivity, { isLoading }] = useUpdateActivityMutation();

  useEffect(() => {
    setActivity(initialActivity);
  }, [initialActivity]);

  const handleSave = async () => {
    try {
      const result = await updateActivity({
        courseId,
        lessonId,
        activityId: activity._id,
        title: activity.title,
        description: activity.description,
        language: activity.language,
        difficulty: activity.difficulty,
        problemStatement: activity.problemStatement,
        codeEditor: activity.codeEditor,
        testCases: activity.testCases,
        expectedImage: activity.expectedImage,
        locked: activity.locked,
        completed: activity.completed,
      }).unwrap();

      onSave(result.activity);
      onClose();
    } catch (error) {
      setError(error.data?.message || 'Failed to update activity');
    }
  };

  const handleChange = (field, value) => {
    setActivity(prevActivity => ({ ...prevActivity, [field]: value }));
  };

  const handleCodeEditorChange = (language, value) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      codeEditor: { ...prevActivity.codeEditor, [language]: value },
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: prevActivity.testCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const handleAddTestCase = () => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: [
        ...prevActivity.testCases,
        { input: '', output: '', required: [''], testCaseSentences: [''], expectedImage: '' }
      ],
    }));
  };



  const handleAddRequiredPair = (testCaseIndex) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: prevActivity.testCases.map((testCase, i) => 
        i === testCaseIndex
          ? {
              ...testCase,
              required: [...testCase.required, ''],
              testCaseSentences: [...testCase.testCaseSentences, '']
            }
          : testCase
      )
    }));
  };

  const handleRemoveRequiredPair = (testCaseIndex, pairIndex) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: prevActivity.testCases.map((testCase, i) => 
        i === testCaseIndex
          ? {
              ...testCase,
              required: testCase.required.filter((_, j) => j !== pairIndex),
              testCaseSentences: testCase.testCaseSentences.filter((_, j) => j !== pairIndex)
            }
          : testCase
      )
    }));
  };

  const handleRequiredChange = (testCaseIndex, pairIndex, value) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: prevActivity.testCases.map((testCase, i) => 
        i === testCaseIndex
          ? {
              ...testCase,
              required: testCase.required.map((req, j) => j === pairIndex ? value : req)
            }
          : testCase
      )
    }));
  };

  const handleTestCaseSentenceChange = (testCaseIndex, pairIndex, value) => {
    setActivity(prevActivity => ({
      ...prevActivity,
      testCases: prevActivity.testCases.map((testCase, i) => 
        i === testCaseIndex
          ? {
              ...testCase,
              testCaseSentences: testCase.testCaseSentences.map((sentence, j) => j === pairIndex ? value : sentence)
            }
          : testCase
      )
    }));
  };

  const isValidTestCases = activity?.testCases.every(
    (tc) => tc.required.length === tc.testCaseSentences.length
  );

  if (!activity) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Edit Activity
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Title"
          fullWidth
          value={activity.title}
          onChange={(e) => handleChange('title', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={activity.description}
          onChange={(e) => handleChange('description', e.target.value)}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Language</InputLabel>
          <Select
            value={activity.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <MenuItem value="HTML">HTML</MenuItem>
            <MenuItem value="CSS">CSS</MenuItem>
            <MenuItem value="JavaScriptConsole">JavaScriptConsole</MenuItem>
            <MenuItem value="JavaScriptWeb">JavaScriptWeb</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={activity.difficulty}
            onChange={(e) => handleChange('difficulty', e.target.value)}
          >
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Problem Statement"
          fullWidth
          multiline
          rows={4}
          value={activity.problemStatement}
          onChange={(e) => handleChange('problemStatement', e.target.value)}
          margin="normal"
          required
        />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Code Editor
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">HTML</Typography>
          <Editor
            height="200px"
            language="html"
            value={activity.codeEditor.html}
            onChange={(value) => handleCodeEditorChange('html', value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">CSS</Typography>
          <Editor
            height="200px"
            language="css"
            value={activity.codeEditor.css}
            onChange={(value) => handleCodeEditorChange('css', value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">JavaScript</Typography>
          <Editor
            height="200px"
            language="javascript"
            value={activity.codeEditor.js}
            onChange={(value) => handleCodeEditorChange('js', value)}
          />
        </Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Test Cases
        </Typography>
        <List>
          {activity.testCases.map((testCase, testCaseIndex) => (
            <ListItem key={testCaseIndex} disablePadding>
              <Box display="flex" flexDirection="column" width="100%" sx={{ mb: 2 }}>
                <TextField
                  label="Input"
                  fullWidth
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(testCaseIndex, 'input', e.target.value)}
                  margin="dense"
                />
                <TextField
                  label="Output"
                  fullWidth
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(testCaseIndex, 'output', e.target.value)}
                  margin="dense"
                />
                {testCase.required.map((req, pairIndex) => (
                  <Grid container spacing={2} key={pairIndex}>
                    <Grid item xs={5}>
                      <TextField
                        label="Required"
                        fullWidth
                        value={req}
                        onChange={(e) => handleRequiredChange(testCaseIndex, pairIndex, e.target.value)}
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        label="Test Case Sentence"
                        fullWidth
                        value={testCase.testCaseSentences[pairIndex]}
                        onChange={(e) => handleTestCaseSentenceChange(testCaseIndex, pairIndex, e.target.value)}
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton onClick={() => handleRemoveRequiredPair(testCaseIndex, pairIndex)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button onClick={() => handleAddRequiredPair(testCaseIndex)} startIcon={<AddIcon />}>
                  Add Required Pair
                </Button>
                {/* <TextField
                  label="Expected Image URL"
                  fullWidth
                  value={testCase.expectedImage}
                  onChange={(e) => handleTestCaseChange(testCaseIndex, 'expectedImage', e.target.value)}
                  margin="dense"
                /> */}
             
              </Box>
            </ListItem>
          ))}
        </List>
        {/* <Button startIcon={<AddIcon />} onClick={handleAddTestCase}>
          Add Test Case
        </Button> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading || !isValidTestCases}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}