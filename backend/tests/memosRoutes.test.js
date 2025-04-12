const axios = require("axios");

let token = null; // Variable to store the JWT token
let mID = null;
// to run these tests make sure you are in the backend folder and run npm start, then in another terimal run npx jest memosRoutes.test.js
// Log in to retrieve a valid JWT token
async function login() {
  const response = await axios.post(`http://localhost:5001/api/user/login`, {
    username: "fullhouse2",
    password: "password",
  });
  token = response.data.token; // Store the token for use in tests
}

beforeAll(async () => {
  await login(); // Ensure login completes before tests run
});

describe("memosRoutes", () => {
  describe("POST /memo", () => {
    test("should create a new memo", async () => { // testing create route
      const response = await axios.post(
        `http://localhost:5001/api/memo/memo`,
        {
          memoID: "testMemo1",
          title: "New Memo",
          content: "New Content",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mID = response.data.memoID;
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("memoID", "testMemo1");
      expect(response.data.title).toBe("New Memo");
    });

    test("should return 400 for invalid input", async () => {
      try {
        await axios.post(
          `http://localhost:5001/api/memo/memo`,
          { title: "" }, // Invalid input
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty("message", "All fields are required");
      }
    });
  });

  describe("GET /house/memos", () => {
    test("should retrieve all memos for a house", async () => {
      const response = await axios.get(`http://localhost:5001/api/memo/house/memos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe("GET /memo/:memoID", () => {
    test("should retrieve a specific memo", async () => {
      const response = await axios.get(`http://localhost:5001/api/memo/memo/${mID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("memoID", "testMemo1");
    });

    test("should return 404 if memo not found", async () => {
      try {
        await axios.get(`http://localhost:5001/api/memo/nonexistent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty("message", "Memo not found");
      }
    });
  });

  describe("PUT /memo/:memoID", () => {
    test("should update a memo", async () => {
      const response = await axios.put(
        `http://localhost:5001/api/memo/memo/${mID}`,
        { title: "Updated Title", content: "Updated Content" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("title", "Updated Title");
    });

    test("should return 404 if memo not found", async () => {
      try {
        await axios.put(
          `http://localhost:5001/api/memo/nonexistent`,
          { title: "Updated Title", content: "Updated Content" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe("DELETE /memo/:memoID", () => {
    test("should delete a memo", async () => {
      const response = await axios.delete(`http://localhost:5001/api/memo/memo/${mID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("memoID", "testMemo1");
    });

    test("should return 404 if memo not found", async () => {
      try {
        await axios.delete(`http://localhost:5001/api/memo/memo/nonexistent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty("message", "Memo not found");
      }
    });
  });
});