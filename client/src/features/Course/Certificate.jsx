import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { BACKEND_URL } from "../../constants";

function Certificate({
  name,
  dateFinished,
  teacherSignature,
  teacherSignatureDetails,
  adminSignature,
  adminSignatureDetails,
  verificationId,
}) {
  return (
    <Box
      className="max-w-4xl mx-auto p-8 bg-white  relative overflow-hidden"
      style={{
        fontFamily: "'Arial', sans-serif",
        backgroundImage: "url('/cert.bg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Geometric Shapes */}
      <Box
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/certbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Certificate Content */}
      <Box className="relative z-10">
        {/* Certificate Header */}
        <Box className="text-center mb-8">
          <Typography
            variant="h3"
            className="font-bold text-gray-800"
            style={{ fontFamily: "'Times New Roman', serif", fontSize: "2.5rem" }}
          >
            CERTIFICATE
          </Typography>
          <Typography
            variant="h4"
            className="font-bold text-gray-800 mt-2"
            style={{ fontFamily: "'Times New Roman', serif", fontSize: "2rem" }}
          >
            OF ACHIEVEMENT
          </Typography>
          <Typography className="text-gray-600 mt-2" style={{ fontSize: "1rem" }}>
            PRESENTED BY CODECRAFT ACADEMY
          </Typography>
        </Box>

        {/* Certificate Body */}
        <Box className="text-center mb-8">
          <Typography className="text-gray-600 mb-4" style={{ fontSize: "1.1rem" }}>
            PROUDLY PRESENTED TO
          </Typography>
          <Typography
            variant="h4"
            className="font-bold text-purple-700 mb-6"
            style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "2.5rem" }}
          >
            {name}
          </Typography>
          <Typography className="text-black" style={{ fontSize: "1rem" }}>
            This certifies that {name} has successfully completed the full course on
          </Typography>
          <Typography
            variant="h5"
            className="font-bold text-black my-2"
            style={{ fontFamily: "'Arial', sans-serif" }}
          >
            Beginner Web Development
          </Typography>
          <Typography className="text-black" style={{ fontSize: "1rem" }}>
            as of {dateFinished}, demonstrating exceptional dedication and hard work.
           
          </Typography>  <Typography className="text-black" style={{ fontSize: "1rem" }}>
          We proudly congratulate them on this well-deserved achievement. well-deserved achievement.
          </Typography>
        </Box>

        {/* Certificate Footer */}
        <Grid container justifyContent="space-between" spacing={4} className="mt-12">
          {/* Signature Section */}
          <Grid item xs={5} textAlign="center">
            <Box className="border-b border-gray-400 pb-2 mb-2">
              <img
                src={`${BACKEND_URL}/certificate/signatures/${teacherSignature}`}
                alt="Teacher Signature"
                className="mx-auto h-12 object-contain"
              />
            </Box>
            <Typography className="font-bold text-black text-sm">
              {teacherSignatureDetails} - Professor
            </Typography>
          </Grid>
          <Grid item xs={2} textAlign="center">
            <img
              src="/certqr.png"
              alt="QR Code"
              className="mx-auto h-24 w-24 object-contain"
            />
          </Grid>
          <Grid item xs={5} textAlign="center">
            <Box className="border-b border-gray-400 pb-2 mb-2">
              <img
                src={`${BACKEND_URL}/certificate/signatures/${adminSignature}`}
                alt="Admin Signature"
                className="mx-auto h-12 object-contain"
              />
            </Box>
            <Typography className="font-bold text-black text-sm">
              {adminSignatureDetails} - Admin/Dean CICS
            </Typography>
          </Grid>
        </Grid>

        {/* Verification ID */}
        <Box className="mt-8 text-center">
          <Typography className="text-gray-600 text-sm">
            VERIFICATION ID: {verificationId}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Certificate;