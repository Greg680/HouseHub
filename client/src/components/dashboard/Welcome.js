import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const WelcomeMessage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token)
        const response = await axios.get("http://localhost:5001/api/user/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsername(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error("Error fetching User:", error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <>
      <Typography variant="h3">Hello {username}</Typography>
    </>
  );
};

export default WelcomeMessage;
