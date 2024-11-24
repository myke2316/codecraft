import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';
import { useUpdateDocumentMutation } from '../../Class/courseService';

const contentTypes = ['sentence', 'snippet', 'code', 'codeconsole', 'javascriptweb'];
const languageOptions = ['html', 'CSS', 'javascript'];

export default function CmsEditDocument({ open, onClose, document: initialDocument, courseId, lessonId, onSave }) {
  const [document, setDocument] = useState(initialDocument);
  const [error, setError] = useState('');
  const [updateDocument, { isLoading }] = useUpdateDocumentMutation();

  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument]);

  const handleSave = useCallback(async () => {
    try {
      const result = await updateDocument({
        courseId,
        lessonId,
        documentId: document._id,
        title: document.title,
        content: document.content,
      }).unwrap();

      onSave(result.document);
      onClose();
    } catch (error) {
      setError(error.data?.message || 'Failed to update document');
    }
  }, [updateDocument, courseId, lessonId, document, onSave, onClose]);

  const handleContentTypeChange = useCallback((index, newType) => {
    setDocument(prevDocument => {
      const newContent = [...prevDocument.content];
      newContent[index] = { 
        ...newContent[index], 
        type: newType,
        language: newType === 'codeconsole' || newType === 'javascriptweb' ? 'javascript' : newContent[index].language,
        text: newType === 'sentence' ? newContent[index].text || '' : undefined,
        code: ['snippet', 'code', 'codeconsole', 'javascriptweb'].includes(newType) ? newContent[index].code || '' : undefined,
        supportingCode: newType === 'javascriptweb' || (newType === 'code' && newContent[index].language === 'CSS') ? newContent[index].supportingCode || '' : undefined,
      };
      return { ...prevDocument, content: newContent };
    });
  }, []);

  const handleContentChange = useCallback((index, field, value) => {
    setDocument(prevDocument => {
      const newContent = [...prevDocument.content];
      newContent[index] = { ...newContent[index], [field]: value };
      return { ...prevDocument, content: newContent };
    });
  }, []);

  const handleAddContent = useCallback(() => {
    setDocument(prevDocument => ({
      ...prevDocument,
      content: [...prevDocument.content, { type: 'sentence', text: '' }],
    }));
  }, []);

  const handleRemoveContent = useCallback((index) => {
    setDocument(prevDocument => ({
      ...prevDocument,
      content: prevDocument.content.filter((_, i) => i !== index),
    }));
  }, []);

  const memoizedContent = useMemo(() => (
    document?.content.map((item, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControl fullWidth sx={{ mr: 2 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={item.type}
                onChange={(e) => handleContentTypeChange(index, e.target.value)}
                required
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* <IconButton onClick={() => handleRemoveContent(index)}>
              <DeleteIcon />
            </IconButton> */}
          </Box>
          {item.type === 'sentence' && (
            <TextField
              label="Text"
              fullWidth
              multiline
              rows={3}
              value={item.text || ''}
              onChange={(e) => handleContentChange(index, 'text', e.target.value)}
              required
            />
          )}
          {['snippet', 'code', 'codeconsole', 'javascriptweb'].includes(item.type) && (
            <>
              {item.type === 'code' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={item.language || 'javascript'}
                    onChange={(e) => handleContentChange(index, 'language', e.target.value)}
                    required
                  >
                    {languageOptions.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 2 }}>
                <Editor
                  height="200px"
                  language={item.type === 'code' ? item.language : 'javascript'}
                  value={item.code || ''}
                  onChange={(value) => handleContentChange(index, 'code', value)}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                  }}
                />
              </Box>
            </>
          )}
          {(item.type === 'javascriptweb' || (item.type === 'code' && item.language === 'CSS')) && (
            <TextField
              label="Supporting Code"
              fullWidth
              multiline
              rows={3}
              value={item.supportingCode || ''}
              onChange={(e) => handleContentChange(index, 'supportingCode', e.target.value)}
              margin="normal"
              required
            />
          )}
        </CardContent>
      </Card>
    ))
  ), [document?.content, handleContentTypeChange, handleContentChange, handleRemoveContent]);

  if (!document) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Document
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
          value={document.title}
          onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
          margin="normal"
          required
        />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Content
        </Typography>
        {memoizedContent}
        {/* <Button startIcon={<AddIcon />} onClick={handleAddContent}>
          Add Content
        </Button> */}
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