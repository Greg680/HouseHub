const request = require("supertest");
const express = require("express");
const userRoutes = require("../routes/userRoutes.js");
const User = require("../models/userModel.js");
const House = require("../models/houseModel.js");
const generateToken = require("../utils/generateToken.js");

jest.mock("../models/userModel.js");
jest.mock("../models/houseModel.js");
jest.mock("../utils/generateToken.js");

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/registration - should create a new user", async () => {
    const mockUser = {
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      age: "25",
      password: "hashedpassword",
      role: "tenant",
      houseID: null,
    };

    User.prototype.save = jest.fn().mockResolvedValue(mockUser);
    generateToken.mockReturnValue("mockToken");

    const response = await request(app)
      .post("/api/registration")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: "25",
        password: "password",
        role: "tenant",
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBe("mockToken");
    expect(User.prototype.save).toHaveBeenCalled();
  });

  test("GET /api/users - should retrieve all users", async () => {
    const mockUsers = [
      { username: "user1", email: "user1@example.com" },
      { username: "user2", email: "user2@example.com" },
    ];

    User.find = jest.fn().mockResolvedValue(mockUsers);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalled();
  });

  test("POST /api/login - should log in a user", async () => {
    const mockUser = {
      username: "testuser",
      password: "hashedpassword",
      houseID: "house123",
      userID: "user123",
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(require("bcryptjs"), "compare").mockResolvedValue(true);
    generateToken.mockReturnValue("mockToken");

    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("mockToken");
    expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
  });

  test("PUT /api/user/:username - should update a user's houseID", async () => {
    const mockHouse = { houseID: "house123" };
    const mockUser = { username: "testuser", houseID: "house123" };

    House.findOne = jest.fn().mockResolvedValue(mockHouse);
    User.findOneAndUpdate = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .put("/api/user/testuser")
      .send({ houseID: "house123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(House.findOne).toHaveBeenCalledWith({ houseID: "house123" });
    expect(User.findOneAndUpdate).toHaveBeenCalled();
  });

  test("DELETE /api/user/:username - should delete a user", async () => {
    const mockUser = { username: "testuser" };

    User.findOneAndDelete = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app).delete("/api/user/testuser");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ username: "testuser" });
  });
});
