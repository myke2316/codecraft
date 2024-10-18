import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";

const QnA = () => {
  const userId = useSelector((state) => state.user.userDetails._id);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Container maxWidth="xxl" className="py-5 px-4 sm:px-6 lg:px-8">
      <div className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8">
        <Typography variant="h4" component="h1" gutterBottom className="text-center mb-6 text-white">
          Community Forum
        </Typography>
        
        <div className="text-center">
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleOpenModal}
            className="bg-white text-blue-600 hover:bg-blue-100"
          >
            Ask a Question
          </Button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Ask a Question
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <QuestionForm userId={userId} onSubmitSuccess={handleCloseModal} />
        </DialogContent>
      </Dialog>

      <QuestionList userId={userId} />
    </Container>
  );
};

export default QnA;