import React from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Editor } from "@monaco-editor/react";

const validationSchema = Yup.object().shape({
  answerContent: Yup.string().required("Answer is required"),
  codeBlocks: Yup.array().of(
    Yup.object().shape({
      language: Yup.string().required("Language is required"),
      content: Yup.string().required("Code content is required"),
    })
  ),
});

const AnswerForm = ({
  open,
  handleClose,
  handleSubmitAnswer,
  answerContent,
  setAnswerContent,
  codeBlocks,
  setCodeBlocks,
  isLoadingAddAnswer,
}) => {
  const handleAnswerChange = (e) => setAnswerContent(e.target.value);

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "html", content: "" }]);
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: "on",
    roundedSelection: false,
    readOnly: false,
    theme: "vs-dark",
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Add Answer
        </Typography>
      </DialogTitle>
      <Formik
        initialValues={{ answerContent, codeBlocks }}
        validationSchema={validationSchema}
        onSubmit={handleSubmitAnswer}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                name="answerContent"
                label="Your Answer"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.answerContent && errors.answerContent}
                helperText={touched.answerContent && errors.answerContent}
                value={answerContent}
                onChange={(e) => {
                  handleAnswerChange(e);
                  setFieldValue("answerContent", e.target.value);
                }}
              />
              <FieldArray name="codeBlocks">
                {() => (
                  <Box>
                    {codeBlocks.map((codeBlock, index) => (
                      <Box key={index} className="mb-6 bg-gray-100 p-4 rounded-lg">
                        <Box className="flex justify-between items-center mb-2">
                          <Typography variant="subtitle1" className="font-semibold text-gray-700">
                            Code Block {index + 1}
                          </Typography>
                          <IconButton onClick={() => handleRemoveCodeBlock(index)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <FormControl fullWidth variant="outlined" margin="normal">
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={codeBlock.language}
                            onChange={(e) => {
                              handleCodeBlockChange(index, "language", e.target.value);
                              setFieldValue(`codeBlocks.${index}.language`, e.target.value);
                            }}
                            label="Language"
                            error={touched.codeBlocks?.[index]?.language && errors.codeBlocks?.[index]?.language}
                          >
                            {["html", "css", "javascript", "php"].map((lang) => (
                              <MenuItem key={lang} value={lang}>
                                {lang.toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.codeBlocks?.[index]?.language && errors.codeBlocks?.[index]?.language && (
                            <Typography color="error" variant="caption">
                              {errors.codeBlocks[index].language}
                            </Typography>
                          )}
                        </FormControl>
                        <Box className="mt-2 border border-gray-300 rounded-md overflow-hidden">
                          <Editor
                            height="200px"
                            language={codeBlock.language}
                            value={codeBlock.content}
                            options={editorOptions}
                            onChange={(value) => {
                              handleCodeBlockChange(index, "content", value);
                              setFieldValue(`codeBlocks.${index}.content`, value);
                            }}
                          />
                        </Box>
                        {touched.codeBlocks?.[index]?.content && errors.codeBlocks?.[index]?.content && (
                          <Typography color="error" variant="caption">
                            {errors.codeBlocks[index].content}
                          </Typography>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddCodeBlock}
                      variant="outlined"
                      color="primary"
                      className="mt-2"
                    >
                      Add Code Block
                    </Button>
                  </Box>
                )}
              </FieldArray>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isLoadingAddAnswer}>
                {isLoadingAddAnswer ? "Submitting..." : "Submit"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AnswerForm;