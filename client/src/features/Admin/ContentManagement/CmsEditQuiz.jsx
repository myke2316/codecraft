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
  List,
  ListItem,
  Radio,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useUpdateQuizMutation } from '../../Class/courseService';

export default function CmsEditQuiz({ open, onClose, quiz: initialQuiz, courseId, lessonId, onSave }) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [error, setError] = useState('');
  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();

  useEffect(() => {
    setQuiz(initialQuiz);
  }, [initialQuiz]);

  const handleSave = async () => {
    try {
      const result = await updateQuiz({
        courseId,
        lessonId,
        quizId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.correctAnswer,
      }).unwrap();

      onSave(result.course);
      onClose();
    } catch (error) {
      setError(error.data?.message || 'Failed to update quiz');
    }
  };

  const handleQuestionChange = (event) => {
    setQuiz(prevQuiz => ({ ...prevQuiz, question: event.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setQuiz(prevQuiz => {
      const newOptions = [...prevQuiz.options];
      newOptions[index] = value;
      return { ...prevQuiz, options: newOptions };
    });
  };

  const handleCorrectAnswerChange = (event) => {
    setQuiz(prevQuiz => ({ ...prevQuiz, correctAnswer: event.target.value }));
  };

  const handleAddOption = () => {
    setQuiz(prevQuiz => {
      if (prevQuiz.options.length < 5) {
        return {
          ...prevQuiz,
          options: [...prevQuiz.options, ''],
        };
      }
      return prevQuiz;
    });
  };

  const handleRemoveOption = (index) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      options: prevQuiz.options.filter((_, i) => i !== index),
      correctAnswer: prevQuiz.correctAnswer === prevQuiz.options[index] ? '' : prevQuiz.correctAnswer,
    }));
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Quiz
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
          label="Question"
          fullWidth
          value={quiz.question}
          onChange={handleQuestionChange}
          margin="normal"
          required
        />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Options (Max 5)
        </Typography>
        <List>
          {quiz.options.map((option, index) => (
            <ListItem key={index} disablePadding>
              <Box display="flex" alignItems="center" width="100%">
                <Radio
                  checked={quiz.correctAnswer === option}
                  onChange={handleCorrectAnswerChange}
                  value={option}
                  name="radio-buttons"
                />
                <TextField
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  fullWidth
                  margin="dense"
                  variant="outlined"
                />
                <IconButton onClick={() => handleRemoveOption(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Button 
          startIcon={<AddIcon />} 
          onClick={handleAddOption}
          disabled={quiz.options.length >= 5}
        >
          Add Option
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading}>
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