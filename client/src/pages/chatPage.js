import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import TheMainNavBar from "../components/layout/MainNav";
import axios from 'axios';
import { Card, Container,Box, CardHeader, CardContent, Typography, Stack,TextField,Button } from '@mui/material';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Refresh page on component mount
  useEffect(() => {
    if (window.location.pathname === '/chat') {
      navigate(0);
    }
  }, [navigate]);

  // Auth & user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get("/api/user/user", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUser(res.data.user);
    }).catch(() => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [navigate]);

  // Socket setup
  useEffect(() => {
    if (!user) return;

    const newSocket = io('', {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('connect', () => setSocket(newSocket));

    return () => newSocket.disconnect();
  }, [user]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('chatHistory', msgs => {
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView();
    });

    socket.on('newMessage', msg => {
      setMessages(prev => [...prev, msg]);
      messagesEndRef.current?.scrollIntoView();
    });

    socket.on('userTyping', ({ username }) => {
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
    });

    socket.on('userStopTyping', ({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username));
    });

    ['userJoined', 'userLeft', 'userDisconnected'].forEach(event => {
      socket.on(event, ({ message }) => {
        setMessages(prev => [...prev, { username: 'System', message, timestamp: new Date(), isSystem: true }]);
        messagesEndRef.current?.scrollIntoView();
      });
    });

    return () => socket.off();
  }, [socket]);

  // Send message
  const sendMessage = e => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('sendMessage', { message: message.trim() });
      socket.emit('stopTyping', user.houseID);
      setMessage('');
    }
  };

  // Handle typing
  const handleTyping = e => {
    setMessage(e.target.value);
    socket?.emit('typing');
    setTimeout(() => socket?.emit('stopTyping', user?.houseID), 2000);
  };



  return (
     <>
  <TheMainNavBar />
  <Container sx={{w:20, display: "flex", justifyContent: "center", alignContent: "center", mt: 5 }}>
    <Box sx={{ mt: 4, px: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/dashboard')}
                sx={{ mb: 3, alignSelf: 'flex-start' }}
              >
                Back to Dashboard
              </Button>
              </Box>
    <Card sx={{width: "75%",
  height: "90vh",
  display: "flex",
  flexDirection: "column"}}>
      <Box sx={{  color: 'white', padding: 2 }}>
        <CardHeader
          title="House Chat"
        sx={{textAlign:"center",fontWeight:"bold", fontSize:"1.5rem"}}
        />
      </Box>

      <CardContent sx={{ flexGrow:1, overflowY: 'auto', padding: 2 }}>
        {messages.map((msg, i) => (
          <Box key={i} sx={{
            margin: '5px 10px',
            padding: 1,
            backgroundColor: msg.isSystem ? '#e0e0e0' :
              (msg.username === user.username ? '#2196f3' : 'white'),
            color: msg.username === user.username && !msg.isSystem ? 'white' : 'black',
            borderRadius: 1,
            textAlign: msg.isSystem ? 'center' : 'left'
          }}>
            {!msg.isSystem && (
              <Box sx={{
                fontWeight: 'bold',
                mb: 0,
                p:0,
                color: msg.username === user.username ? '#f0f0f0' : '#333'
              }}>
                {msg.username} {msg.username === user.username && '(You)'}
              </Box>
            )}
            <Box sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.message}</Box>
            <Typography variant="caption" sx={{ color: '', display: 'block', textAlign: 'right' }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {typingUsers.length > 0 && (
        <Stack sx={{ padding: 1, fontSize: 12, fontStyle: 'italic' }}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Stack>
      )}

      <Box component="form" onSubmit={sendMessage} sx={{
        display:"flex",
        padding: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          size="small"
          sx={{ mr: 1 }}
        />
        <Button type="submit" variant="contained" disabled={!message.trim()}>
          Send
        </Button>
      </Box>
    </Card>
  </Container>
</>

  );
};

export default ChatPage;
