import React from "react";
import { Box, Typography } from "@mui/material";
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
      className="relative bg-white overflow-hidden"
      sx={{
        width: "1200px",
        height: "900px",
        fontFamily: "'Arial', sans-serif",
        backgroundImage: "url('/cert.bg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Geometric Shapes */}
      <Box
        className="absolute inset-0"
        sx={{
          backgroundImage: "url('/certbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Certificate Content */}
      <Box className="relative z-10 h-full flex flex-col justify-between p-16">
        {/* Certificate Header */}
        <Box className="text-center">
          <Typography
            variant="h3"
            className="font-bold text-gray-800"
            sx={{ fontFamily: "'Times New Roman', serif", fontSize: "48px" }}
          >
            CERTIFICATE
          </Typography>
          <Typography
            variant="h4"
            className="font-bold text-gray-800 mt-2"
            sx={{ fontFamily: "'Times New Roman', serif", fontSize: "36px" }}
          >
            OF ACHIEVEMENT
          </Typography>
          <Typography sx={{ fontSize: "24px", color: "#666" }}>
            PRESENTED BY CODECRAFT
          </Typography>
        </Box>

        {/* Certificate Body */}
        <Box className="text-center">
          <Typography sx={{ fontSize: "28px", color: "#666", mb: 4 }}>
            PROUDLY PRESENTED TO
          </Typography>
          <Typography
            variant="h4"
            className="font-bold text-purple-700 mb-6"
            sx={{ fontFamily: "'Arial Black', sans-serif", fontSize: "48px" }}
          >
            {name}
          </Typography>
          <Typography sx={{ fontSize: "24px", color: "#000" }}>
            This certifies that {name} has successfully completed the full course on
          </Typography>
          <Typography
            variant="h5"
            className="font-bold text-black my-2"
            sx={{ fontFamily: "'Arial', sans-serif", fontSize: "32px" }}
          >
            Beginner Web Development
          </Typography>
          <Typography sx={{ fontSize: "24px", color: "#000" }}>
            as of {dateFinished}, demonstrating exceptional dedication and hard work.
          </Typography>
          <Typography sx={{ fontSize: "24px", color: "#000" }}>
            We proudly congratulate them on this well-deserved achievement
          </Typography>
        </Box>

        {/* Certificate Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 8 }}>
          {/* Signature Section */}
          <Box sx={{ textAlign: "center", width: "30%" }}>
            <Box sx={{ borderBottom: "1px solid #666", pb: 2, mb: 2 }}>
              <img
                src={`${BACKEND_URL}/certificate/signatures/${teacherSignature}`}
                alt="Teacher Signature"
                style={{ height: "60px", objectFit: "contain", margin: "0 auto" }}
              />
            </Box>
            <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
              {teacherSignatureDetails} - Professor
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", width: "30%" }}>
            <img
              src="/certqr.png"
              alt="QR Code"
              style={{ height: "120px", width: "120px", objectFit: "contain", margin: "0 auto" }}
            />
          </Box>
          <Box sx={{ textAlign: "center", width: "30%" }}>
            <Box sx={{ borderBottom: "1px solid #666", pb: 2, mb: 2 }}>
              <img
                src={`${BACKEND_URL}/certificate/signatures/${adminSignature}`}
                alt="Admin Signature"
                style={{ height: "60px", objectFit: "contain", margin: "0 auto" }}
              />
            </Box>
            <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
              {adminSignatureDetails} - Admin
            </Typography>
          </Box>
        </Box>

        {/* Verification ID */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{ color: "#666", fontSize: "18px" }}>
            VERIFICATION ID: {verificationId}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Certificate;