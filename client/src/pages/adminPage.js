import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from 'axios';
import { Container, Box, Button } from "@mui/material"; // Import Button
import TheMainNavBar from "components/layout/MainNav";

// Import the card components to handle a tenant or landlord
import TenantCard from "../components/adminPage/TenantCard";
import LandlordCard from "../components/adminPage/LandlordCard";
import ProfileCard from "../components/adminPage/profileCard"; // Import ProfileCard

const drawerWidth = 240; // Adjust based on your SideNav width

const AdminPage = ({ userTheme, setUserTheme }) => {
	//Usernames are passed as a parameter in the URL
	const { username } = useParams();
	const navigate = useNavigate(); // Initialize useNavigate
	const [role, setRole] = useState('');
	//Usestate to store the role of the user
	const [loading, setLoading] = useState(true);
	// ensures admin cannot be accessed directly without auth
	  const token = localStorage.getItem("token");
	  useEffect(() => {
		if (!token) {
		  navigate('/');
		}
	  }, [token, navigate]);

	//function to fetch the user role from the server when loading components
	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					"/api/user/user",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				console.log(response.data.user.role);
				setRole(response.data.user.role);
			} catch (error) {
				console.error('Error fetching user role:', error);
			} finally {
				setLoading(false);
			}
		};

		if (localStorage.getItem('token')) {
			fetchUserRole();
		}
	}, [username]);

	if (loading) {
		return <Container><Box sx={{ mt: 4 }}>Loading...</Box></Container>;
	}

	//Render the TenantCard or LandlordCard based on the role of the user

	return (
		<Container maxWidth={false} disableGutters>
			<TheMainNavBar />

			<Container>
				<Box sx={{ mt: 4, px: 2 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate('/dashboard')}
						sx={{ mb: 3, alignSelf: 'flex-start' }}
					>
						Back to Dashboard
					</Button>
					<Box
						display="flex"
						flexDirection={{ xs: 'column', md: 'row' }}
						gap={4}
						justifyContent="center"
						alignItems="flex-start"
					>
						<Box flex={1}>
						<ProfileCard userTheme={userTheme} setUserTheme={setUserTheme} />
						</Box>
						<Box flex={1}>
							{role === 'tenant' ? (
								<TenantCard username={username} />
							) : role === 'landlord' ? (
								<LandlordCard username={username} />
							) : (
								<Box
									sx={{
										textAlign: 'center',
										padding: '20px',
										border: '1px solid #ddd',
										borderRadius: '8px'
									}}
								>
									No role assigned or invalid role.
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Container>
		</Container>
	);
};

export default AdminPage;
