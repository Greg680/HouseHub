import { Typography, Avatar, Container } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import defaultLogo from "assets/blank-profile-picture-973460_640.png";

const WelcomeMessage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "/api/user/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        mt: 2,
      }}
    >
      <Typography variant="h3" sx={{ paddingRight: 2 }}>
        Hello {user?.firstName || "User"}
      </Typography>
      <Avatar
        alt="User Avatar"
        src={
          user?.profileImage
            ? `/uploads/${user.profileImage}`
            : defaultLogo
        }
        sx={{ height: 80, width: 80 }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultLogo;
        }}
      />
    </Container>
  );
};

export default WelcomeMessage;
