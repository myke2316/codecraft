import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const socialIcons = [
  { Icon: Facebook, link: 'https://facebook.com' },
  { Icon: Twitter, link: 'https://twitter.com' },
  { Icon: Instagram, link: 'https://instagram.com' },
  { Icon: LinkedIn, link: 'https://linkedin.com' },
];

function FooterLayout() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 py-6 bg-gradient-to-r from-purple-100 to-indigo-100"
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: '1440px' }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          className="border-t pt-6"
          sx={{ borderColor: 'rgba(63, 0, 129, 0.3)' }}
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Box display="flex" alignItems="center" mb={{ xs: 3, md: 0 }}>
              <motion.img
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                src="/new.png"
                alt="CodeCraft Logo"
                style={{ width: '60px', height: '50px', marginRight: '15px' }}
              />
              <Typography
                variant="h5"
                className="font-bold tracking-wide"
                sx={{
                  color: 'rgb(63, 0, 129)',
                  fontFamily: 'monospace',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}
              >
                {"<"}CODECRAFT/{">"}™
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Box display="flex" flexDirection="column" alignItems={{ xs: 'center', md: 'flex-end' }}>
              {/* <Box mb={2}>
                {socialIcons.map(({ Icon, link }, index) => (
                  <motion.div
                    key={link}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    style={{ display: 'inline-block' }}
                  >
                    <IconButton
                      component="a"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgb(63, 0, 129)',
                        '&:hover': { color: 'rgb(130, 60, 200)' },
                        transition: 'color 0.3s ease',
                      }}
                    >
                      <Icon />
                    </IconButton>
                  </motion.div>
                ))}
              </Box> */}
              <Typography
                variant="body2"
                className="text-sm"
                sx={{
                  color: 'rgba(63, 0, 129, 0.7)',
                  fontWeight: 500,
                  textAlign: { xs: 'center', md: 'right' },
                }}
              >
                CodeCraft© {new Date().getFullYear()}. All Rights Reserved.
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </motion.footer>
  );
}

export default FooterLayout;