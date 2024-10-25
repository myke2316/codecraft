import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

const Certificatev2 = ({name,dateFinished,course,signature,signatureDetails}) => {
  return (
    <Box
      className="relative w-full max-w-4xl mx-auto bg-white shadow-lg font-sans overflow-hidden"
      sx={{
        backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-K9CpKCm8DJ6qLL2wzPfpN4wgn4eDHO.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '842px', // A4 height at 96 DPI
        width: '595px',  // A4 width at 96 DPI
      }}
    >
      <Box className="relative z-10 p-8 h-full flex flex-col justify-between">
        {/* Certificate Header */}
        <Box className="text-center mb-8">
          <Typography variant="h3" className="font-bold text-gray-800" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
            CERTIFICATE
          </Typography>
          <Typography variant="h3" className="font-bold text-gray-800" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
            OF ACHIEVEMENT
          </Typography>
          <Typography className="text-gray-600 mt-2" style={{ fontSize: '1rem' }}>
            PRESENTED BY CODECRAFT
          </Typography>
        </Box>

        {/* Certificate Body */}
        <Box className="flex-grow">
          <Typography className="text-center mb-4" style={{ fontSize: '1.2rem' }}>
            PROUDLY PRESENTED TO
          </Typography>
          <Typography variant="h4" className="font-bold text-center text-purple-700 mb-6" style={{ fontSize: '3rem' }}>
            {name}
          </Typography>
          <Typography className="text-center mb-6" style={{ fontSize: '1rem', maxWidth: '80%', margin: '0 auto' }}>
            This certifies that <strong>{name}</strong> has successfully completed the full course
            on <strong>{course}</strong> as of {dateFinished}, demonstrating exceptional
            dedication and hard work. We proudly congratulate them on this well-deserved achievement.
          </Typography>
        </Box>

        {/* Certificate Footer */}
        <Box>
          <Grid container justifyContent="space-between" alignItems="flex-end">
            <Grid item xs={5}>
              <Box className="border-t border-gray-400 pt-2">
                <Typography className="font-bold text-sm">ASST. PROF. SHIELA MARIE G. GARCIA</Typography>
                <Typography className="text-xs">ADMIN/DEAN, CICS</Typography>
              </Box>
            </Grid>
            <Grid item xs={5}>
              <Box className="border-t border-gray-400 pt-2">
                <Typography className="font-bold text-sm">MR. EDDIE D. BUCAD JR.</Typography>
                <Typography className="text-xs">PROFESSOR</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box className="mt-4 flex items-center">
            <Box className="w-16 h-16 border border-gray-400 mr-4 flex items-center justify-center">
              <Typography className="text-xs">QR Code</Typography>
            </Box>
            <Box>
              <Typography className="text-xs">VERIFICATION ID:</Typography>
              <Typography className="text-xs font-bold">Vuias7d2231</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Certificatev2;
