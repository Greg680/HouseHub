import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/theme';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from 'pages/landingPage';
import LoginPage from 'pages/loginPage';
import DashBoard from 'pages/mainDash';
import AdminPage from 'pages/adminPage';
import Redirect from 'pages/redirect';
import axios from 'axios';

function App() {
  const [mode, setMode] = useState('dark');
  const [userTheme, setUserTheme] = useState('default');


  useEffect(() => {
    const fetchUserTheme = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5001/api/user/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const themeFromUser = res.data?.user?.userTheme || 'default';
        setUserTheme(themeFromUser);
      } catch (err) {
        console.error('Failed to fetch user theme:', err.message);
      }
    };

    fetchUserTheme();
  }, []);

  const theme = useMemo(() => getTheme(mode, userTheme), [mode, userTheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Redirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
