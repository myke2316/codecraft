// ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

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
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
