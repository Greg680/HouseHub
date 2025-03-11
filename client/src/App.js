import React, {useState, useMemo}  from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/theme';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from 'pages/landingPage';
import LoginPage from 'pages/loginPage';
import DashBoard from 'pages/mainDash';
import AdminPage from 'pages/adminPage';

function App(){

  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getTheme(mode), [mode])

  // console.log(theme.palette); Testing global pallette

  return (
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element ={<DashBoard />} />
        <Route path="/admin" element ={<AdminPage />} />
    </Routes>
</BrowserRouter>
</ThemeProvider>
  );
}

export default App