import React, { useState } from 'react';
import JoinHouseCard from './JoinHouseCard'; // Import JoinHouseCard component

import axios from 'axios';
import {
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Container,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';

const RegisterCard = ({ onToggle }) => {

	//Card to handle the registration of a new user, and then send them to the JoinHouseCard to handle the house creation or joining process

	const [username, setUsername] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [age, setAge] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('tenant');
	const [houseID, setHouseID] = useState('');
	//using useState hooks to set the initial state of the user registration form to an empty string

	const [showJoinHouse, setShowJoinHouse] = useState(false); // State to toggle JoinHouseCard

	//function caled to handle the submit of the registration form, sends a post to the server.
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('/api/user/registration', {
				username,
				firstName,
				lastName,
				email,
				age,
				password,
				role,
				houseID,
			});


			console.log('User registered:', response.data);
			setShowJoinHouse(true);

		} catch (error) {
			alert("This username is already taken, please choose another one.");
			console.error('Error registering user:', error);
		}
	};

	if (showJoinHouse) {
		return <JoinHouseCard username={username} password={password} />; // Render JoinHouseCard if needed
	}

	// Return registration form, with username, first name, last name, email, age, password, and role fields, done with Material UI.

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
						Register
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
							size="small"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="firstName"
							label="First Name"
							name="firstName"
							autoComplete="given-name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							size="small"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="lastName"
							label="Last Name"
							name="lastName"
							autoComplete="family-name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							size="small"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							size="small"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="age"
							label="Age"
							name="age"
							type="number"
							value={age}
							inputProps={{ min: 1,
								max: 99}}
							onChange={(e) => setAge(e.target.value)}
							size="small"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							size="small"
						/>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel id="role-label">Role</InputLabel>
							<Select
								labelId="role-label"
								id="role"
								value={role}
								label="Role"
								onChange={(e) => setRole(e.target.value)}
							>
								<MenuItem value="landlord">Landlord</MenuItem>
								<MenuItem value="tenant">Tenant</MenuItem>
							</Select>
						</FormControl>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Register
						</Button>
						<Button
							fullWidth
							variant="outlined"
							onClick={onToggle}
							sx={{ mb: 2 }}
						>
							Back to Login
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);
};

export default RegisterCard;