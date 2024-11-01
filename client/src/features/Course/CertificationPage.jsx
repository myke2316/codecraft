import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useSelector } from "react-redux";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Certificate from "./Certificate";
import { useCompleteCourseMutation } from "../LoginRegister/userService";
import {
  useCreateCertificateMutation,
  useGetCertificateQuery,
  useGetSignatureForStudentQuery,
} from "./certificateService";

const CertificationPage = () => {
  const [open, setOpen] = useState(false);
  const certificateRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  const user = useSelector((state) => state.user.userDetails);
  const userProgress = useSelector((state) => state.studentProgress.userProgress);
  const classId = useSelector((state) => state.class.class._id);
  const userId = user._id;

  const lastCourse = userProgress.coursesProgress[userProgress.coursesProgress.length - 1];
  const dateFinished = lastCourse?.dateFinished;
  const formattedDate = new Date(dateFinished).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const { data: signatureData } = useGetSignatureForStudentQuery({ userId, classId });
  const [completeCourse] = useCompleteCourseMutation();
  const [createCertificate] = useCreateCertificateMutation();
  const { data: certificateFetch } = useGetCertificateQuery(userId);

  const handleOpen = async () => {
    await completeCourse(userId).unwrap();
    await createCertificate({
      studentId: userId,
      dateFinished,
      classId,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const updateScale = () => {
      if (certificateRef.current) {
        const containerWidth = certificateRef.current.offsetWidth;
        const newScale = containerWidth / 1200; // 1200px is the certificate width
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [open]);

  const downloadImage = () => {
    const certificateElement = certificateRef.current;
    if (!certificateElement) return;

    const originalTransform = certificateElement.style.transform;
    certificateElement.style.transform = 'none';

    html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: false,
      width: 1200,
      height: 900,
      scale: 2,
    }).then((canvas) => {
      certificateElement.style.transform = originalTransform;
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "certificate.png";
      link.click();
    });
  };

  const downloadPDF = () => {
    const certificateElement = certificateRef.current;
    if (!certificateElement) return;

    const originalTransform = certificateElement.style.transform;
    certificateElement.style.transform = 'none';

    html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: false,
      width: 1200,
      height: 900,
      scale: 2,
    }).then((canvas) => {
      certificateElement.style.transform = originalTransform;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1200, 900]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 1200, 900);
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
        minHeight: "100vh",
        textAlign: "center",
        p: 2,
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

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '100vw',
            height: 'auto',
            maxHeight: '90vh',
            m: 0,
          }
        }}
      >
        <DialogTitle>Certificate of Completion</DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div 
              ref={certificateRef}
              style={{
                width: '1200px',
                height: '900px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <Certificate
                name={user.username}
                dateFinished={formattedDate}
                adminSignature={signatureData?.adminSignature?.signatureId}
                adminSignatureDetails={signatureData?.adminSignature?.name}
                teacherSignature={signatureData?.teacherSignature?.signatureId}
                teacherSignatureDetails={signatureData?.teacherSignature?.name}
                verificationId={certificateFetch?.certificate?.verificationId}
              />
            </div>
          </Box>
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