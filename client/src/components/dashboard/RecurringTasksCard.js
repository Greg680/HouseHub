import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  CardHeader,
  IconButton,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const RecurringTasksCard = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: "",
    frequency: "daily",
    nextDueDate: "",
  });
  const [userMap, setUserMap] = useState({}); // Map of userID to username
  const [editingTask, setEditingTask] = useState(null); // Track the task being edited

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/scheduler/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allTasks = response.data;
      const completed = allTasks.filter((task) => task.completed);
      const pending = allTasks.filter((task) => !task.completed);

      setTasks(pending);
      setCompletedTasks(completed);
    } catch (error) {
      console.error("Error fetching recurring tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleCompleteTask = async (taskID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/scheduler/tasks/${taskID}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch updated tasks after completing the task
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask({
      taskID: task.taskID,
      taskName: task.taskName,
      frequency: task.frequency,
      nextDueDate: task.nextDueDate,
    });
  };

  const handleEditChange = (event) => {
    setEditingTask({ ...editingTask, [event.target.name]: event.target.value });
  };

  const handleFrequencyChange = (event) => {
    const { value } = event.target;
    setNewTask({ ...newTask, frequency: value });
  };

  const handleEditFrequencyChange = (event) => {
    const { value } = event.target;
    setEditingTask({ ...editingTask, frequency: value });
  };

  const handleSaveEdit = async (taskID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/scheduler/tasks/${taskID}`,
        editingTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch updated tasks after saving the edit
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task edit:", error);
    }
  };

  const handleDeleteTask = async (taskID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/scheduler/tasks/${taskID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch updated tasks after deleting the task
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.taskName.trim() || !newTask.nextDueDate.trim()) {
      alert("Task name and due date cannot be empty!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/scheduler/tasks",
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch updated tasks after creating the new task
      fetchTasks();
      setNewTask({ taskName: "", frequency: "daily", nextDueDate: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Container sx={{ maxWidth: "sm", margin: "auto", paddingTop: 4 }}>
      <Card
        sx={{
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
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
            title="Recurring Tasks"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          />
          <IconButton
            color="secondary"
            onClick={() => setShowCreateForm(true)}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {showCreateForm && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                fullWidth
                label="Task Name"
                value={newTask.taskName}
                onChange={(e) =>
                  setNewTask({ ...newTask, taskName: e.target.value })
                }
                sx={{ marginBottom: 1 }}
              />
              <FormControl fullWidth sx={{ marginBottom: 1 }}>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  value={newTask.frequency}
                  onChange={handleFrequencyChange}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Next Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newTask.nextDueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, nextDueDate: e.target.value })
                }
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  sx={{ marginRight: 1 }}
                  onClick={handleCreateTask}
                >
                  Create
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.taskID} sx={{ mb: 2 , position:"relative"}}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {editingTask && editingTask.taskID === task.taskID ? (
                  <Box>
                    <TextField
                      fullWidth
                      name="taskName"
                      label="Task Name"
                      value={editingTask.taskName}
                      onChange={handleEditChange}
                      sx={{ marginBottom: 1 }}
                    />
                    <FormControl fullWidth sx={{ marginBottom: 1 }}>
                      <InputLabel id="edit-frequency-label">Frequency</InputLabel>
                      <Select
                        labelId="edit-frequency-label"
                        value={editingTask.frequency}
                        onChange={handleEditFrequencyChange}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      name="nextDueDate"
                      label="Next Due Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={editingTask.nextDueDate}
                      onChange={handleEditChange}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveEdit(task.taskID)}
                        sx={{ marginRight: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setEditingTask(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {task.taskName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Frequency: {task.frequency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next Due Date:{" "}
                      {new Date(task.nextDueDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To: {userMap[task.currentAssignedUser] || "Unknown"}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  {!editingTask && (
                    <>
                   <Box sx={{position:"absolute",  top:8, right:8}}>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditClick(task)}
                        sx={{color:"#6b6b6b"}}
                      >
                        <EditIcon />
                      </IconButton>
                      </Box>
                      {/* <IconButton
                        color="error"
                        onClick={() => handleDeleteTask(task.taskID)}
                      >
                        <DeleteIcon />
                      </IconButton> */}
                      <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTask(task.taskID)}



                    >
                      Delete
                    </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleCompleteTask(task.taskID)}
                      >
                        Complete Task
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No recurring tasks available.
          </Typography>
        )}
      </Card>

      {completedTasks.length > 0 && (
        <Card
          sx={{
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            padding: 2,
            marginTop: 4,
          }}
        >
          <CardHeader
            title="Completed Tasks"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          />
          {completedTasks.map((task, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {task.taskName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Completed By: {userMap[task.lastCompletedBy] || "Unknown"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Card>
      )}
    </Container>
  );
};

export default RecurringTasksCard;
