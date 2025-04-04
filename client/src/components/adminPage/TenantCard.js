import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/system'; // Import Box for layout enhancements

// TenantCard component displays the house details and tenants for the tenant
const TenantCard = () => {
    const [tenants, setTenants] = useState([]); // State for tenants
    const [house, setHouse] = useState(null); // State for house details

    const navigate = useNavigate();

    // Fetch house and tenant details on component mount
    useEffect(() => {
        const fetchHouse = async () => {
            const token = localStorage.getItem('token');
            try {
                const houseResponse = await axios.get(
                    "/api/house/house",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setHouse(houseResponse.data);
                console.log('House:', houseResponse.data);
                const tenantInfo = [];
                const tenantIDs = houseResponse.data.tenants;
                console.log('Tenant IDs:', tenantIDs);
                if (tenantIDs.length === 0) {
                    console.log('No tenants in house');
                    return "No tenants in house";   
                } else if (tenantIDs.length === 1) {
                    console.log('One tenant in house');
                    let tempTenant = await axios.get(`/api/user/user/id/${tenantIDs[0]}`);
                    tenantInfo.push(tempTenant.data);
                    console.log('Tenant Info:', tenantInfo);
                } else {    
                    for(let i = 0; i < tenantIDs.length; i++) {
                        let tempTenant = await axios.get(`/api/user/user/id/${tenantIDs[i]}`);
                        tenantInfo.push(tempTenant.data);
                    }
                }
                console.log('Tenant Info:', tenantInfo);
                setTenants(tenantInfo);
            } catch (error) {
                console.error('Error fetching house or tenants:', error);
            }
        };

        fetchHouse();
    }, []);

    // Handle quitting the house
    const handleQuitHouse = async () => {
        try {
            const token = localStorage.getItem('token');
            const userResponse = await axios.get(
                `/api/user/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const userID = userResponse.data.user.userID;
            console.log('User ID:', userID);

            await axios.put(
                `/api/house/removeTenant/${userID}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await axios.put(
                `/api/user/user/${userResponse.data.user.username}`,
                { houseID: null },
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Remove the token from localStorage
            localStorage.removeItem('token');

            setHouse(null);
            setTenants([]);
            navigate('/login');
            
        } catch (error) {
            console.error('Error quitting house:', error);
        }
    };

    // Render the tenant list and quit house button
    return (
        <Card sx={{ maxWidth: 600, margin: '20px auto', padding: '20px', boxShadow: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" color="primary">
                        Tenant Dashboard
                    </Typography>
                </Box>
                {house && (
                    <Box mb={3}>
                        <Typography variant="h6" color="textSecondary">
                            House Details
                        </Typography>
                        <Typography variant="body1">House ID: {house.houseID}</Typography>
                        <Typography variant="body1">House Key: {house.key}</Typography>
                    </Box>
                )}
                <Typography variant="h5" color="textSecondary" mb={2}>
                    Tenants
                </Typography>
                <List>
                    {tenants.map(tenant => (
                        <ListItem 
                            key={tenant.userID} 
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                        >
                            <ListItemText 
                                primary={
                                    <Typography variant="h6" color="textPrimary">
                                        {tenant.firstName} {tenant.lastName}
                                    </Typography>
                                } 
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            Age: {tenant.age}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            Email: {tenant.email}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            Username: {tenant.username}
                                        </Typography>
                                    </>
                                } 
                            />
                        </ListItem>
                    ))}
                </List>
                <Box mt={3} textAlign="center">
                    <Button variant="contained" color="error" onClick={handleQuitHouse}>
                        Quit House
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TenantCard;
