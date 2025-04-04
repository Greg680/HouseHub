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
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ToDoCard = () => {
  const [toDos, setToDos] = useState([]);
  const [newToDo, setNewToDo] = useState({ content: "", dueDate: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingToDo, setEditingToDo] = useState(null);

  useEffect(() => {
    const fetchToDos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "/api/todolist/house",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setToDos(response.data);
      } catch (error) {
        console.error("Error fetching to-dos:", error);
      }
    };
    fetchToDos();
  }, []);

  const handleCreateToDo = async () => {
    if (!newToDo.content.trim() || !newToDo.dueDate.trim()) {
      alert("Content and due date cannot be empty!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/todolist/todolists",
        newToDo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setToDos([...toDos, response.data]);
      setNewToDo({ content: "", dueDate: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating to-do:", error);
    }
  };

  const handleDelete = async (taskID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/todolist/todolist/${taskID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToDos(toDos.filter((todo) => todo.taskID !== taskID));
    } catch (error) {
      console.error("Error deleting to-do:", error);
    }
  };

  const handleToggleStatus = async (taskID, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/todolist/todolist/${taskID}`,
        { taskStatus: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToDos(
        toDos.map((todo) =>
          todo.taskID === taskID
            ? { ...todo, taskStatus: !currentStatus }
            : todo
        )
      );
    } catch (error) {
      console.error("Error updating to-do status:", error);
    }
  };

  const handleEditClick = (todo) => {
    setEditingToDo({
      taskID: todo.taskID,
      content: todo.content,
      dueDate: todo.dueDate,
    });
  };

  const handleEditChange = (event) => {
    setEditingToDo({ ...editingToDo, [event.target.name]: event.target.value });
  };

  const handleSaveEdit = async (taskID) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/todolist/todolist/${taskID}`,
        editingToDo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToDos(
        toDos.map((todo) =>
          todo.taskID === taskID ? { ...todo, ...editingToDo } : todo
        )
      );
      setEditingToDo(null);
    } catch (error) {
      console.error("Error updating to-do:", error);
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
          position: "relative",
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
            title="To-Do List"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          />
          <IconButton color="secondary" onClick={() => setShowCreateForm(true)}>
            <AddIcon />
          </IconButton>
        </Box>

        {showCreateForm && (
          <Card>
            <CardContent>
              <TextField
                fullWidth
                label="Content"
                value={newToDo.content}
                onChange={(e) =>
                  setNewToDo({
                    ...newToDo,
                    content: e.target.value,
                  })
                }
                sx={{ marginBottom: 1 }}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newToDo.dueDate}
                onChange={(e) =>
                  setNewToDo({
                    ...newToDo,
                    dueDate: e.target.value,
                  })
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
                  onClick={handleCreateToDo}
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

        {toDos.length > 0 ? (
          toDos.map((todo) => (
            <Card key={todo.taskID} sx={{ mb: 2, position: "relative", p:"18px" }}>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {editingToDo && editingToDo.taskID === todo.taskID ? (
                  <Box>
                    <TextField
                      fullWidth
                      name="content"
                      label="Content"
                      value={editingToDo.content}
                      onChange={handleEditChange}
                      sx={{ marginBottom: 1 }}
                    />
                    <TextField
                      fullWidth
                      name="dueDate"
                      label="Due Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={editingToDo.dueDate}
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
                        onClick={() => handleSaveEdit(todo.taskID)}
                        sx={{ marginRight: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setEditingToDo(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box display={"flex"}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: todo.taskStatus
                            ? "line-through"
                            : "none",
							fontWeight:"bold"
                        }}
                      >
                        {todo.content}
                      </Typography>
                      <Checkbox
                        checked={todo.taskStatus}
                        onChange={() =>
                          handleToggleStatus(todo.taskID, todo.taskStatus)
                        }
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Due: {todo.dueDate}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box>
                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      color: "#6b6b6b",
                    }}
                    color="primary"
                    onClick={() => handleEditClick(todo)}
                  >
                    <EditIcon />
                  </IconButton>
                  <Box>
                    {/* <IconButton
										color="error"
										onClick={() => handleDelete(todo.taskID)}

									>
										<DeleteIcon />
									</IconButton> */}
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(todo.taskID)}
					  sx={{
						position: "absolute",
						right: 16,
						bottom: 16,

					  }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No to-do items available. Start adding tasks!
          </Typography>
        )}
      </Card>
    </Container>
  );
};

export default ToDoCard;
