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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const MemoCard = () => {
	const [memos, setMemos] = useState([]);
	const [newMemo, setNewMemo] = useState({ title: "", content: "" });
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingMemo, setEditingMemo] = useState(null);

	useEffect(() => {
		const fetchMemos = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get(
					"/api/memo/house/memos",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setMemos(response.data);
			} catch (error) {
				console.error("Error fetching memos:", error);
			}
		};
		fetchMemos();
	}, []);

	const handleCreateMemo = async () => {
		if (!newMemo.title.trim() || !newMemo.content.trim()) {
			alert("Title and content cannot be empty!");
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				"/api/memo/memo",
				newMemo,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setMemos([...memos, response.data]);
			setNewMemo({ title: "", content: "" });
			setShowCreateForm(false);
		} catch (error) {
			console.error("Error creating memo:", error);
		}
	};

	const handleDelete = async (id) => {
		try {
			const token = localStorage.getItem("token");
			await axios.delete(`/api/memo/memo/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setMemos(memos.filter((m) => m.memoID !== id));
		} catch (error) {
			console.error("Error deleting memo:", error);
		}
	};

  const handleEditClick = (memo) => {
    setEditingMemo({
      memoID: memo.memoID,
      title: memo.title,
      content: memo.content,
    });
  };


	const handleEditChange = (event) => {
		setEditingMemo({ ...editingMemo, [event.target.name]: event.target.value });
	};
  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/memo/memo/${id}`,
        editingMemo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMemos(memos.map((m) => (m.memoID === id ? editingMemo : m)));
      setEditingMemo(null);
    } catch (error) {
      console.error("Error updating memo:", error);
    }
  };
  return (
    <Container sx={{ maxWidth: "sm", margin: "auto", paddingTop: 4 }} >
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
            title="Memos"
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
                label="Title"
                value={newMemo.title}
                onChange={(e) =>
                  setNewMemo({ ...newMemo, title: e.target.value })
                }
                sx={{
                  marginBottom: 1,

                  borderRadius: "5px",
                }}
              />
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={3}
                value={newMemo.content}
                onChange={(e) =>
                  setNewMemo({ ...newMemo, content: e.target.value })
                }
                sx={{  borderRadius: "5px" }}
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
                  onClick={handleCreateMemo}
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

        {memos.length > 0 ? (
          memos.map((memo) => (
            <Card key={memo.memoID} sx={{ mb: 2 }}>
              <CardContent sx={{ position: "relative" }}>
                {editingMemo && editingMemo.memoID === memo.memoID ? (
                  <>
                    <TextField
                      fullWidth
                      name="title"
                      label="Title"
                      variant="outlined"
                      value={editingMemo.title}
                      onChange={handleEditChange}
                      sx={{ marginBottom: 1 }}
                    />
                    <TextField
                      fullWidth
                      name="content"
                      label="Content"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={editingMemo.content}
                      onChange={handleEditChange}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSave(memo.memoID)}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setEditingMemo(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <IconButton
                      aria-label="edit"
                      sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        color: "#6b6b6b",
                      }}
                      onClick={() => handleEditClick(memo)}
                    >
                      <EditIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {memo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {memo.content}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(memo.memoID)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No memos available. Start adding notes!
          </Typography>
        )}
      </Card>
    </Container>
  );
}
export default MemoCard;