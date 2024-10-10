import { Box, Typography, Grid } from "@mui/material";
import React from "react";
import { BACKEND_URL } from "../../constants";

function Certificate({
  name,
  dateFinished,
  teacherSignature,
  teacherSignatureDetails,
  adminSignature,
  adminSignatureDetails,
}) {
  return (
    <Box
      className="max-w-4xl mx-auto p-8 bg-white rounded-lg border-4 border-indigo-500"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      {/* Certificate Header */}
      <Box className="text-center mb-10">
        <Typography
          variant="h3"
          className="font-bold text-indigo-700"
          style={{ fontFamily: "'Merriweather', serif", fontSize: "2.5rem" }}
        >
          Certificate of Achievement
        </Typography>
        <Typography
          className="text-gray-600 italic mt-2"
          style={{ fontSize: "1.1rem" }}
        >
          Presented by CodeCraft Academy
        </Typography>
        <div className="w-20 mx-auto my-3 border-b-2 border-indigo-400"></div>
      </Box>

      {/* Certificate Body */}
      <Grid container justifyContent="center" spacing={4}>
        {/* Student Name */}
        <Grid item xs={12} textAlign="center">
          <Typography
            variant="h5"
            className="font-semibold text-2xl underline text-indigo-700 mb-2"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            {name}
          </Typography>
          <Typography
            className="italic text-gray-600 mb-5"
            style={{ fontSize: "1rem" }}
          >
            has successfully completed
          </Typography>
        </Grid>

        {/* Course Title */}
        <Grid item xs={12} textAlign="center">
          <Typography
            className="text-gray-600 italic mb-2"
            style={{ fontSize: "1rem" }}
          >
            the full course on
          </Typography>
          <Typography
            variant="h6"
            className="font-bold text-xl underline text-indigo-700"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Beginner Web Development
          </Typography>
        </Grid>
      </Grid>

      {/* Certificate Footer */}
      {/* Certificate Footer */}
      <Grid container justifyContent="center" spacing={4} mt={8}>
        {/* Signature Section */}
        <Grid item xs={12} sm={4} textAlign="center">
          <div className="block underline my-4">
            <img
              src={`${BACKEND_URL}/certificate/signatures/${teacherSignature}`}
              alt="Signature"
              className="mx-auto w-32"
            />
          </div>

          <Typography className="font-bold text-gray-800">{teacherSignatureDetails}</Typography>
        </Grid>{" "}
        <Grid item xs={12} sm={4} textAlign="center">
          <div className="block underline my-4">
            <img
              src={`${BACKEND_URL}/certificate/signatures/${adminSignature}`}
              alt="Signature"
              className="mx-auto w-32"
            />
          </div>
          <Typography className="font-bold text-gray-800">{adminSignatureDetails}</Typography>
        </Grid>
      </Grid>

      {/* Date of Completion */}
      <Box className="mt-8 text-center">
        <Typography className="text-gray-600 italic">
          Completed on: {dateFinished}
        </Typography>
      </Box>
    </Box>
  );
}

export default Certificate;
