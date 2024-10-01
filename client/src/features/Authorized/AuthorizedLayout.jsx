
import React, { useState, useMemo } from 'react'
import { Outlet } from "react-router"
import { ToastContainer } from "react-toastify"
import AuthorizedSidebar from "./NavBar/AuthorizedNavBar"
import { useSelector } from "react-redux"
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material'

function AuthorizedLayout() {
  const [open, setOpen] = useState(true)
  const user = useSelector((state) => state.user.userDetails)
  const [mode, setMode] = useState('light')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#1976d2' },
                background: { default: '#f5f5f5', paper: '#ffffff' },
                text: { primary: '#333333', secondary: '#555555' },
              }
            : {
                primary: { main: '#90caf9' },
                background: { default: '#1e1e1e', paper: '#2d2d2d' },
                text: { primary: '#ffffff', secondary: '#b0b0b0' },
              }),
        },
        typography: {
          fontFamily: 'Poppins, Arial, sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            `,
          },
        },
      }),
    [mode],
  )

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
        {user.role && (
          <AuthorizedSidebar 
            open={open} 
            setOpen={setOpen} 
            toggleTheme={toggleTheme}
            mode={mode}
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: "all 0.3s ease",
            marginLeft: open ? "0px" : "0px",
            width: open ? "calc(100% - 240px)" : "calc(100% - 60px)",
          }}
        >
          <Box>
            <Outlet />
          </Box>
          <ToastContainer />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default AuthorizedLayout