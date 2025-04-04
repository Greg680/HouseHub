import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  IconButton,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  CardHeader
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const UtilityCard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBill, setNewBill] = useState({
    title: "",
    desc: "",
    dueDate: "",
    amount: "",
  });
  const [bills, setBills] = useState([]);
  const [payment, setPayment] = useState({ amountPaid: "" });
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [userMap, setUserMap] = useState({}); // Map of userID to username

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "/api/bills/house",

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched Bills:", response.data);
        setBills(response.data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };
    fetchBills();
  }, []);

  const handleCreateBill = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/bills/create",
        newBill,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBills([...bills, response.data]);
      setNewBill({ title: "", desc: "", dueDate: "", amount: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating bill:", error);
    }
  };

  const handleMakePayment = (billID) => {
    setConfirmingPayment(billID);
  };

  const handleConfirmPayment = async (billID) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/bills/pay/${billID}`,
        { amountPaid: parseFloat(payment.amountPaid) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBills(
        bills.map((bill) => (bill._id === billID ? response.data : bill))
      );
      setConfirmingPayment(null);
      setPayment({ amountPaid: "" });
      alert("Payment Successful!");
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };
  // map users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/user/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = response.data;
        const userMapping = users.reduce((map, user) => {
          map[user.userID] = user.username;
          return map;
        }, {});
        setUserMap(userMapping);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteBill = async (billID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bills/delete/${billID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(bills.filter((b) => b._id !== billID));
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  return (
    <Container sx={{ maxWidth: "sm", margin: "auto", paddingTop: 4 }}>
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: "12px",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
           <CardHeader
            title="Bill Management"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          />
          <IconButton color="primary" onClick={() => setShowCreateForm(true)}>
            <AddIcon />
          </IconButton>
        </Box>
        {showCreateForm && (
          <Box sx={{ padding: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newBill.title}
              onChange={(e) =>
                setNewBill({ ...newBill, title: e.target.value })
              }
              sx={{ marginBottom: 1 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newBill.desc}
              onChange={(e) => setNewBill({ ...newBill, desc: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
            <TextField
              fullWidth
              type="date"
              value={newBill.dueDate}
              onChange={(e) =>
                setNewBill({ ...newBill, dueDate: e.target.value })
              }
              sx={{ marginBottom: 1 }}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={newBill.amount}
              onChange={(e) =>
                setNewBill({ ...newBill, amount: e.target.value })
              }
              sx={{ marginBottom: 1 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateBill}
                startIcon={<SaveIcon />}
              >
                Create
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowCreateForm(false)}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
        {bills.length > 0 ? (
          bills.map((bill) => (
            <Card
              key={bill._id}
              sx={{
              mb:2
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{fontWeight:"Bold"}}>{bill.title}</Typography>
                <Typography variant="body2">{bill.desc}</Typography>
                <Typography variant="subtitle2">
                  Due Date: {bill.dueDate}
                </Typography>
                <Typography variant="subtitle1" color="error">
                  Remaining Amount: ${bill.amount}
                </Typography>
                <Box sx={{ marginTop: 1 }}>
                  <Typography variant="subtitle2">Payments:</Typography>
                  <List dense>
                    {bill.paid.map((payment, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={` ${userMap[payment.userID]}: $${payment.amountPaid}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                {confirmingPayment === bill._id ? (
                  <Box sx={{ marginTop: 2 }}>
                    <TextField
                      fullWidth
                      label="Enter Payment Amount"
                      type="number"
                      inputProps={{ min: 1,
                        max: bill.amount}}
                      value={payment.amountPaid}
                      onChange={(e) =>
                        setPayment({ amountPaid: e.target.value })
                      }
                      sx={{ marginBottom: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleConfirmPayment(bill._id)}
                      startIcon={<SaveIcon />}
                    >
                      Confirm Payment
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      marginTop: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleMakePayment(bill._id)}
                      startIcon={<SaveIcon />}
                    >
                      Make Payment
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteBill(bill._id)}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No bills found.
          </Typography>
        )}
      </Card>
    </Container>
  );
};

export default UtilityCard;
