import { Box, Container, Typography } from '@mui/material';

function FooterLayout() {
  return (
    <footer className=" text-white py-3">
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          className="border-t border-gray-700 pt-4"
        >
          {/* Footer Title */}
          <Typography
            variant="h6"
            className="text-2xl font-bold tracking-wide"
            style={{ color: 'rgb(160, 80, 0)', fontFamily: 'monospace' }}
          >
            {"<"}CODECRAFT/{" >"}™
          </Typography>

          {/* All Rights Reserved Text */}
          <Typography
            variant="body2"
            className="text-sm text-gray-400 mt-4 sm:mt-0"
          >
            CodeCraft© 2024. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </footer>
  );
}

export default FooterLayout;
