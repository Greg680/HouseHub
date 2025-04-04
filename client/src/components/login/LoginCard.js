import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Container,
	Box,
} from '@mui/material';
import axios from 'axios';
import JoinHouseCard from './JoinHouseCard'; // Import JoinHouseCard component


const LoginCard = ({ onToggle }) => {
	// use Navigate custom hook for navigating to dashboard for when login is successful
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState(''); // State for username and password, it uses the useState hook to set the initial state to an empty string
	const [showJoinHouse, setShowJoinHouse] = useState(); // State to toggle JoinHouseCard


	//Button to handle the submit of the login form, routes to the join house card if the user has a RHP response (Register House protocol 🤑🤑🤑)
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('/api/user/login', {
				username,
				password,
			});
			console.log('User logged in:', response.data);

			if (response.data.message === "RHP") {
				console.log('User needs to join a house');
				setShowJoinHouse(true); // Explicitly set to true to show JoinHouseCard
			} else {
				// if login successful and house exists we navigate
				localStorage.setItem("token", response.data.token);
				setUsername('');
				setPassword('');
				navigate('/dashboard');
			}
		} catch (error) {
			console.error('Error logging in:', error);
		}
	};

	// If showJoinHouse is true, render the JoinHouseCard component
	if (showJoinHouse) {
		return <JoinHouseCard username={username} password={password} />; // Render JoinHouseCard if needed
	}

	// Return login form, with username and password fields, done with Material UI.

	return (
		<Container
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
			}}
		>
			<Card sx={{ width: '20rem', boxShadow: 5 }}>
				<CardContent>
					<Typography variant="h5" component="div" align="center" gutterBottom>
						Login
					</Typography>
					<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							name="username"
							autoComplete="username"
							autoFocus
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Login
						</Button>
						<Button
							fullWidth
							variant="outlined"
							onClick={onToggle}
							sx={{ mb: 2 }}
						>
							Register
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);
};

export default LoginCard;