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
  useMediaQuery,
  useTheme,
  Grid
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import { useSelector } from "react-redux";

const QnA = () => {
  const userId = useSelector((state) => state.user.userDetails._id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Container maxWidth="xxl" className="py-5 px-4 sm:px-6 lg:px-8">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
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
        </Grid>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="md"
          PaperProps={{
            style: {
              padding: isSmallScreen ? '8px' : '16px',
            },
          }}
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
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </DialogActions>
        </Dialog>

        <Grid item xs={12}>
          <QuestionList userId={userId} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default QnA;
