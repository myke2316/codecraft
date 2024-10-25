import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  Box,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Container,
  SwipeableDrawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap');
      `,
    },
  },
});

export default function NavItems() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    { text: 'HOME', path: '/' },
    { text: 'COURSE', path: '/aboutCourse' },
    { text: 'ABOUT', path: '/about' },
  ];

  const NavLink = ({ to, children, ...props }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          component={RouterLink}
          to={to}
          sx={{
            color: isActive ? 'rgb(150, 130, 255)' : 'rgb(75, 57, 135)',
            fontSize: { xs: '16px', sm: '18px' },
            fontWeight: isActive ? 700 : 500,
            position: 'relative',
            padding: { xs: '12px', sm: '12px 16px' },
            width: '100%',
            justifyContent: 'flex-start',
            '&:hover': {
              color: 'rgb(150, 130, 255)',
              backgroundColor: 'transparent',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '2px',
              backgroundColor: 'rgb(198, 55, 255)',
              bottom: '0',
              left: 0,
              transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.3s ease-in-out',
            },
            '&:hover::after': {
              transform: 'scaleX(1)',
            },
          }}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  };

  const drawer = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        bgcolor: 'background.paper',
        p: 2,
      }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          component={RouterLink}
          to="/"
          onClick={handleDrawerToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textTransform: 'none',
            color: 'rgb(75, 57, 135)',
          }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="img"
              src="/new.png"
              alt="CodeCraft logo"
              sx={{ width: 40, height: 40, mr: 1 }}
            />
          </motion.div>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'normal', fontSize: '20px' }}>
            CodeCraft
          </Typography>
        </Button>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ width: '100%' }}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListItem disablePadding sx={{ mb: 2 }}>
              <NavLink to={item.path} onClick={handleDrawerToggle} fullWidth>
                {item.text}
              </NavLink>
            </ListItem>
          </motion.div>
        ))}
      </List>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleDrawerToggle}
          fullWidth
          sx={{
            mt: 4,
            backgroundColor: 'rgb(75, 57, 135)',
            color: 'white',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgb(150, 130, 255)',
            },
          }}
        >
          LOG IN
        </Button>
      </motion.div>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar 
        position="fixed"
        color="transparent" 
        elevation={0}
        sx={{ 
          borderBottom: '1px solid rgba(75, 57, 135, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: { xs: 1, sm: 2 } }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'none',
                  color: 'rgb(75, 57, 135)',
                  '&:hover': {
                    color: 'rgb(150, 130, 255)',
                  },
                  transition: 'color 0.3s ease-in-out',
                }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    component="img"
                    src="/new.png"
                    alt="CodeCraft logo"
                    sx={{ width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 }, mr: 1 }}
                  />
                </motion.div>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'normal', fontSize: { xs: '20px', sm: '24px' } }}>
                  CodeCraft
                </Typography>
              </Button>
            </motion.div>

            {!isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                {navItems.map((item) => (
                  <NavLink key={item.text} to={item.path}>
                    {item.text}
                  </NavLink>
                ))}
              </Box>
            )}

            {!isMobile && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: 'rgb(75, 57, 135)',
                    borderColor: 'rgb(75, 57, 135)',
                    '&:hover': {
                      backgroundColor: 'rgba(75, 57, 135, 0.04)',
                      borderColor: 'rgb(150, 130, 255)',
                      color: 'rgb(150, 130, 255)',
                    },
                  }}
                >
                  LOG IN
                </Button>
              </motion.div>
            )}

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  color: 'rgb(75, 57, 135)',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>

        <AnimatePresence>
          {isMobile && (
            <SwipeableDrawer
              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerToggle}
              onOpen={handleDrawerToggle}
              disableBackdropTransition
              disableDiscovery
              PaperProps={{
                sx: {
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 400 },
                },
              }}
            >
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {drawer}
              </motion.div>
            </SwipeableDrawer>
          )}
        </AnimatePresence>
      </AppBar>
      <Toolbar /> {/* This empty Toolbar acts as a spacer */}
    </ThemeProvider>
  );
}