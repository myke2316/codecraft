import { Box, Typography, Grid } from "@mui/material";
import React from "react";

function Certificate({ name, dateFinished }) {
  return (
    <Box
      className="max-w-4xl mx-auto p-10 bg-white rounded-xl  border-8 border-indigo-600"
    >
      {/* Certificate Header */}
      <Box className="text-center mb-8">
        <Typography
          variant="h4"
          className="font-bold text-indigo-600 text-3xl md:text-4xl"
        >
          CodeCraft's Certificate of Course Completion
        </Typography>
        <div className="w-32 mx-auto my-4 border-b-4 border-indigo-400"></div>
      </Box>

      {/* Certificate Body */}
      <Grid container justifyContent="center" spacing={4}>
        {/* Student Name */}
        <Grid item xs={12} sm={10} textAlign="center">
          <Typography
            variant="h5"
            className="font-bold underline text-xl mb-4"
          >
            {name}
          </Typography>
          <Typography className="italic text-gray-600">
            has successfully earned
          </Typography>
        </Grid>

        {/* Course Title */}
        <Grid item xs={12} textAlign="center">
          <Typography className="italic text-gray-600">
            while completing the full web development course
          </Typography>
          <Typography
            variant="h5"
            className="font-bold underline text-xl mt-4"
          >
            CodeCraft's Beginner Web Development Course
          </Typography>
        </Grid>
      </Grid>

      {/* Certificate Footer */}
      <Grid container justifyContent="center" spacing={4} mt={8}>
        {/* Signature Section */}
        <Grid item xs={12} sm={4} textAlign="center">
          <Typography className="font-bold text-gray-600 text-sm">
            Batangas State University - JPLPC Malvar
          </Typography>
          <div className="block underline my-4">
            <img
              src="/esignature.png"
              alt="Signature"
              className="mx-auto w-32"
            />
          </div>
          <Typography className="font-bold text-gray-800">
            Mr. Eddie Rackiel Bucad Jr.
          </Typography>
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
