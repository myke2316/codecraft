import { Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Certificate from "./Certificate";
import "./certificate.css";

const CertificationPage = () => {
  const [open, setOpen] = useState(false);
  const certificateRef = useRef(null);

  // User Information
  const user = useSelector((state) => state.user.userDetails);
  const userProgress = useSelector((state) => state.studentProgress.userProgress);

  // Date of Completion
  const lastCourse = userProgress.coursesProgress[userProgress.coursesProgress.length - 1];
  const dateFinished = lastCourse?.dateFinished;
  const formattedDate = new Date(dateFinished).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  // Necessary Data for certificate (Editable)
  const certificateData = {
    name: user.username,
    course: "Web Development - Beginner",
    description: 'Completed the "Beginner Web Development Course',
    dateOfCompletion: formattedDate,
    signature: "/esignature.png",
    signatureDetails: "Sir Eddie Bucad",
  };

  // Open Dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Close Dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Download as Image
  const downloadImage = () => {
    html2canvas(certificateRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "certificate.png";
      link.click();
    });
  };

  // Download as PDF
  const downloadPDF = () => {
    html2canvas(certificateRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
  
      // Get canvas dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
  
      // Create a jsPDF instance in landscape mode
      const pdf = new jsPDF("landscape");
  
      // Calculate the width and height of the image to maintain the aspect ratio
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
  
      // Center the image in the PDF
      const xOffset = (pageWidth - newWidth) / 2;
      const yOffset = (pageHeight - newHeight) / 2;
  
      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, newWidth, newHeight);
      pdf.save("certificate.pdf");
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" fontWeight="bold" mb={4}>
        Congratulations!
      </Typography>
      <Typography variant="h5" mb={4}>
        You have successfully completed the course.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Get Certificate
      </Button>

      {/* Dialog for Certificate */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Certificate of Completion</DialogTitle>
        <DialogContent>
          {/* Ref for certificate content */}
          <div ref={certificateRef} style={{ padding: '20px' }}>
            <Certificate
              name={certificateData.name}
              dateFinished={certificateData.dateOfCompletion}
              course={certificateData.course}
              signature={certificateData.signature}
              signatureDetails={certificateData.signatureDetails}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadImage} variant="contained" color="secondary">
            Download as Image
          </Button>
          <Button onClick={downloadPDF} variant="contained" color="secondary">
            Download as PDF
          </Button>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificationPage;
