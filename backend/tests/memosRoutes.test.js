const axios = require("axios");
const request = require("supertest");
const express = require("express");
const authorisationMiddleware = require("../middleware/authorisationMiddleware");

let token = null; // Variable to store the JWT token

beforeAll(async () => {
  // Log in to retrieve a valid JWT token
  const mockResponse = await axios.post(`http://localhost:5001/user/login`, {
    username: "fullhouse2",
    password: "password", 
  });

  expect(mockResponse.status).toBe(200);
  expect(mockResponse.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  token = mockResponse.data.token; // Store the token for use in tests
});

describe("memosRoutes", () => {
  describe("POST /memo", () => {
    test("should create a new memo", async () => {
      const response = await axios.post(
        `http://localhost:5001/api/memo/memo`,
        {
          memoID: "1test",
          title: "New Memo",  
          content: "New Content",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("memoID", "1test");
      expect(response.data.title).toBe("New Memo");
    });

    test("should return 400 for invalid input", async () => {
      try {
        await axios.post(
          `http://localhost:5001/api/memo`,
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
      const response = await axios.get(`http://localhost:5001/api/house/memos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe("GET /memo/:memoID", () => {
    test("should retrieve a specific memo", async () => {
      const response = await axios.get(`http://localhost:5001/api/memo/1test`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("memoID", "1test");
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
        `http://localhost:5001/api/memo/1test`,
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
        expect(error.response.data).toHaveProperty("message", "Memo not found");
      }
    });
  });

  describe("DELETE /memo/:memoID", () => {
    test("should delete a memo", async () => {
      const response = await axios.delete(`http://localhost:5001/api/memo/1test`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("memoID", "1test");
    });

    test("should return 404 if memo not found", async () => {
      try {
        await axios.delete(`http://localhost:5001/api/memo/nonexistent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty("message", "Memo not found");
      }
    });
  });
});