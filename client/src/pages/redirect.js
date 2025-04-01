// pages/RedirectLogic.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Redirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  }, [navigate]);

  return null; // or a spinner/loading indicator
};

export default Redirect;