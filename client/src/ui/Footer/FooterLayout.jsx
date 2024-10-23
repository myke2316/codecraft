import { Box, Container, Typography } from '@mui/material';
import footerimg from "./images/new.png"

function FooterLayout() {
  return (
    <footer className="mt-8 py-3">
      <Container
        maxWidth={false} // Disable the default maxWidth
        sx={{ maxWidth: '1440px' }} // Custom max width of 1440px
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          className="border-t pt-4"
          sx={{ borderColor: 'rgba(63, 0, 129, 0.3)' }} // Border color with transparency
        >
          {/* Footer Logo and Title */}
          <Box display="flex" alignItems="center">
            <img
              
              src={footerimg} // Replace with your image path
              alt="CodeCraft Logo"
              style={{ width: '50px', height: '40px', marginRight: '10px' }} // Adjust size and spacing
            />
            <Typography
              variant="h6"
              className="text-2xl font-bold tracking-wide"
              style={{ color: 'rgb(63, 0, 129)', fontFamily: 'monospace' }}
            >
              {"<"}CODECRAFT/{" >"}™
            </Typography>
          </Box>

          {/* All Rights Reserved Text */}
          <Typography
            variant="body2"
            className="text-sm mt-4 sm:mt-0"
            style={{ color: 'rgba(63, 0, 129, 0.7)' }} // Light purple for "All Rights Reserved"
          >
            CodeCraft© 2024. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </footer>
  );
}

export default FooterLayout;
