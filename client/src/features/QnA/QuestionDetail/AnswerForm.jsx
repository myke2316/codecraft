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
  Alert,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Editor } from "@monaco-editor/react";

const validationSchema = Yup.object().shape({
  answerContent: Yup.string().required("Answer is required").max(200,"Answer cannot exceed 200 characters"),
  codeBlocks: Yup.array()
    .of(
      Yup.object().shape({
        language: Yup.string().required("Language is required"),
        content: Yup.string().required("Code content is required"),
      })
    )
    .max(6, "Maximum of 6 code blocks allowed"),
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
  const initialValues = {
    answerContent: answerContent,
    codeBlocks: codeBlocks,
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
        <Alert severity="warning">
          Your answer is being monitored by the admin, please be careful with
          your answer.
        </Alert>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitAnswer}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
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
                helperText={`${answerContent.length}/200 characters`}
               
                onChange={(e) => {
                  setFieldValue("answerContent", e.target.value);
                  setAnswerContent(e.target.value);
                }}
              />
              <FieldArray name="codeBlocks">
                {({ push, remove }) => (
                  <Box>
                    {values.codeBlocks.map((codeBlock, index) => (
                      <Box
                        key={index}
                        className="mb-6 bg-gray-100 p-4 rounded-lg"
                      >
                        <Box className="flex justify-between items-center mb-2">
                          <Typography
                            variant="subtitle1"
                            className="font-semibold text-gray-700"
                          >
                            Code Block {index + 1}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              remove(index);
                              setCodeBlocks(values.codeBlocks.filter((_, i) => i !== index));
                            }}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <FormControl
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        >
                          <InputLabel>Language</InputLabel>
                          <Field
                            as={Select}
                            name={`codeBlocks.${index}.language`}
                            label="Language"
                            error={
                              touched.codeBlocks?.[index]?.language &&
                              errors.codeBlocks?.[index]?.language
                            }
                          >
                            {["html", "css", "javascript", "php"].map(
                              (lang) => (
                                <MenuItem key={lang} value={lang}>
                                  {lang.toUpperCase()}
                                </MenuItem>
                              )
                            )}
                          </Field>
                          {touched.codeBlocks?.[index]?.language &&
                            errors.codeBlocks?.[index]?.language && (
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
                              setFieldValue(
                                `codeBlocks.${index}.content`,
                                value
                              );
                              const newCodeBlocks = [...values.codeBlocks];
                              newCodeBlocks[index].content = value;
                              setCodeBlocks(newCodeBlocks);
                            }}
                          />
                        </Box>
                        {touched.codeBlocks?.[index]?.content &&
                          errors.codeBlocks?.[index]?.content && (
                            <Typography color="error" variant="caption">
                              {errors.codeBlocks[index].content}
                            </Typography>
                          )}
                      </Box>
                    ))}
                    {values.codeBlocks.length < 6 && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newCodeBlock = { language: "html", content: "" };
                          push(newCodeBlock);
                          setCodeBlocks([...values.codeBlocks, newCodeBlock]);
                        }}
                        variant="outlined"
                        color="primary"
                        className="mt-2"
                      >
                        Add Code Block
                      </Button>
                    )}
                    {errors.codeBlocks &&
                      typeof errors.codeBlocks === "string" && (
                        <Typography
                          color="error"
                          variant="caption"
                          className="mt-2 block"
                        >
                          {errors.codeBlocks}
                        </Typography>
                      )}
                  </Box>
                )}
              </FieldArray>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoadingAddAnswer}
              >
                {isLoadingAddAnswer || isSubmitting
                  ? "Submitting..."
                  : "Submit"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AnswerForm;