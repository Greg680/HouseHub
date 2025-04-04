import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import defaultLogo from "assets/blank-profile-picture-973460_640.png";
import ThemeSelector from "./ThemeSelector";
import axios from "axios";

const ProfileCard = ({ userTheme, setUserTheme }) => {
;
  const [user, setUser] = useState(null); // State for user details
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [formData, setFormData] = useState({}); // State for form data
  const [selectedImage, setSelectedImage] = useState(null); // state for image

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "/api/user/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
        setFormData({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          age: response.data.user.age,
          userTheme: response.data.user.userTheme || "default"
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUser();
  }, []);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  const handleThemeChange = async (newTheme) => {
    setFormData((prev) => ({ ...prev, userTheme: newTheme }));
    setUserTheme(newTheme);
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `/api/user/theme`,
        { theme: newTheme },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser((prevUser) => ({ ...prevUser, userTheme: newTheme }));

    } catch (err) {
      console.error("Theme update failed", err);
    }
  };
  // Handle saving the updated user details
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log("Uploading image:", selectedImage);
      const response = await axios.put(
        // Use the new endpoint
        `/api/user/user/updateFields/${user.username}`,
        formData, // Send only the fields being updated
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", response.data); // Log the response for debugging
      setUser({ ...user, ...formData }); // Update local state with the new data
      setEditMode(false);

      if (selectedImage) {
        const imageForm = new FormData();
        imageForm.append("profileImage", selectedImage);

        try {
          await axios.post(
            `/api/user/user/uploadProfileImage/${user.userID}`,
            imageForm,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Image uploaded successfully");
        } catch (imageError) {
          console.error("Image upload failed:", imageError);

          alert("Profile updated, but image upload failed.");
        }
      }
    } catch (error) {
      console.error(
        "Error updating user details:",
        error.response?.data || error.message
      ); // Log detailed error
      alert(
        `Failed to update user: ${
          error.response?.data?.message || error.message
        }`
      ); // Show error to the user
    }
  };

  if (!user) {
    return <Typography>No user </Typography>;
  }

  return (
    <Card
      sx={{
        display: "flex",
        maxWidth: "60%",
        margin: "20px auto",
        padding: "20px",
        boxShadow: 3,
        borderRadius: "12px",
        justifyContent:"center"
      }}
    >
      <CardContent>
        <Typography variant="h4" color="primary" mb={3}justifySelf={"flex-start"}>
          Profile
        </Typography>
        {editMode ? (
          <Box component="form" noValidate autoComplete="off">
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="profileImageUpload">
                <input
                  accept="image/*"
                  id="profileImageUpload"
                  type="file"
                  style={{ display: "none" }}
                  name="profileImage"
                  onChange={handleImageChange}
                />
                <Avatar
                  alt="User Avatar"
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : user.profileImage
                      ? `/uploads/${user.profileImage}`
                      : defaultLogo
                  }
                  sx={{ height: 80, width: 80, cursor: "pointer" }}
                />
              </label>
              <Typography variant="p">Click image to change</Typography>
            </Box>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              type="number"
              slotProps={{
                min: 1,
                max: 120,
                step: 1,
              }}helperText="Enter a valid age between 1 and 120"
              error={formData.age !== "" && (formData.age < 1 || formData.age > 120)}
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <Box mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Theme Color
  </Typography>
  <ThemeSelector
    currentTheme={formData.userTheme}
    onThemeChange={handleThemeChange}
  />
</Box>
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ px: 4 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditMode(false)}
                sx={{ px: 4 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
            }}
          >
            <Avatar
              alt="User Avatar"
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : user.profileImage
                  ? `/uploads/${user.profileImage}`
                  : defaultLogo
              }
              sx={{ height: 80, width: 80, cursor: "pointer" }}
            />
            <Box sx={{mt:2}}>

                <Typography variant="body1" fontSize="1.1rem" mb={1.5}>
                  <strong>First Name:</strong> {user.firstName}
                </Typography>
                <Typography variant="body1" fontSize="1.1rem" mb={1.5}>
                  <strong>Last Name:</strong> {user.lastName}
                </Typography>
                <Typography variant="body1" fontSize="1.1rem" mb={1.5}>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body1" fontSize="1.1rem">
                  <strong>Age:</strong> {user.age}
                </Typography>
                <Typography variant="body1" fontSize="1.1rem" mb={1.5}>
  <strong>Theme:</strong> {user.userTheme}
</Typography>
              </Box>

            <Box textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
                sx={{ px: 4 , mt:3}}
              >
                Edit Profile
              </Button>

            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
