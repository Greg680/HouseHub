import React, { useState, useEffect } from 'react';
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
// JoinHouseCard component allows users to join an existing house or create a new one based on their role
const JoinHouseCard = ({ username, password }) => {
	const [houseID, setHouseID] = useState('');
	const [userID, setUserID] = useState('');
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [eircode, setEircode] = useState('');
	const [role, setRole] = useState('');

	// Fetch user role and userID based on the username
	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const response = await axios.get(`/api/user/user/${username}`);
				setRole(response.data.role);
				console.log('User id:', response.data.userID);
				setUserID(response.data.userID);
			} catch (error) {
				console.error('Error fetching user role:', error);
			}
		};
		fetchUserRole();
	}, [username]);

	// Handle joining an existing house
	const handleJoinHouse = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.put(`/api/user/user/${username}`, {
				houseID,
			});
			const loginToken = await axios.post('/api/user/login', {
				username,
				password,
			});
			if (!loginToken) {
				console.log("No token received");
				return;
			}

			localStorage.setItem("token", loginToken.data.token);
			console.log('UserToken: ' + loginToken.data.token);

			// Include userID in the request body
			const response2 = await axios.put(
				`/api/house/addTenant/${houseID}`,
				{ userID: userID }, // Include userID in the request body
				{
					headers: {
						Authorization: `Bearer ${loginToken.data.token}`,
					},
				}
			);
			console.log('House joined:', response.data, "UserToken: ", loginToken.data.token, "  HouseToken:", response2.data);
			window.location.href = '/dashboard';

		} catch (error) {
			console.error('Error joining house:', error.response ? error.response.data : error.message);
			alert('Failed to join house. invalid houseID.');
		}
	};

	// Handle creating a new house
	const handleCreateHouse = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('/api/house/create', {
				name,
				address,
				eircode,
				userID,
			});

			console.log('House created:', response.data);

			const house = await axios.put(`/api/user/user/${username}`, {
				houseID: response.data.houseID,
			});

			const loginToken = await axios.post('/api/user/login', {
				username,
				password,
			});

			if (loginToken) {
				localStorage.setItem("token", loginToken.data.token);
				window.location.href = '/dashboard';
			}
		} catch (error) {
			console.error('Error creating house:', error);
		}
	};

	// Form for creating a new house
	const createHouseForm = () => (
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
						Create House
					</Typography>
					<Box component="form" onSubmit={handleCreateHouse} noValidate sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="name"
							label="House Name"
							name="name"
							autoComplete="name"
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="address"
							label="Address"
							name="address"
							autoComplete="address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="eircode"
							label="Eircode"
							name="eircode"
							autoComplete="eircode"
							value={eircode}
							onChange={(e) => setEircode(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Create House
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);

	// Form for joining an existing house
	const joinHouseForm = () => (
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
						Join House
					</Typography>
					<Box component="form" onSubmit={handleJoinHouse} noValidate sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="houseID"
							label="House ID"
							name="houseID"
							autoComplete="houseID"
							autoFocus
							value={houseID}
							onChange={(e) => setHouseID(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Join House
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);

	// Render the appropriate form based on the user's role
	return role === 'landlord' ? createHouseForm() : joinHouseForm();
};

export default JoinHouseCard;