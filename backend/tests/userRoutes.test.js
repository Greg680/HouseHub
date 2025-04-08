//Defining dependencies for the tests.
const request = require("supertest");
const express = require("express");
const axios = require('axios');
const authorise = require("../middleware/authorisationMiddleware.js");

//To be able to run the following tests, you need to have the server running on localhost:5001.

//André Pont - I developed my unit test for the user routes using Jest and following this guide:
// Devot.team. (2024). API Testing with Jest: A Step-by-Step Guide. [online] Available at: https://devot.team/blog/jest-api-testing [Accessed 8 Apr. 2025].

//Mocking the dependencies to isolate the tests from the actual implementations.

const app = express();
app.use(express.json());

describe("Testing the user Routes", () => {
	//Creating a user by registrating
	let token = null;
	let mockUser = {};

	test("POST /api/registration - should create a new user", async () => {
		const mockResponse = await axios.post("http://localhost:5001/api/user/registration",{ 
			username: "testuser",
			firstName: "Test",
			lastName: "User",
			email: "test@example.com",
			age: "25",
			password: "password",
			role: "tenant",
		});
		// console.log(mockResponse.data);
		expect(mockResponse.status).toBe(201);
		
	});

	//Update a user's houseID
	test("PUT /api/user/:username - should update a user's houseID", async () => {

		const mockResponse = await axios.put("http://localhost:5001/api/user/user/testuser", {
			houseID: "50962f35-4c81-43aa-b97e-411548ff552e",
		});

		// console.log(mockResponse.data);
		mockUser = mockResponse.data;
		expect(mockResponse.data.houseID).toBe("50962f35-4c81-43aa-b97e-411548ff552e");

	});

	//Loging in
	test("POST /api/login - should log in a user", async () => {

		const mockResponse = await axios.post("http://localhost:5001/api/user/login", {
			username: "testuser",
			password: "password",
		});

		token = mockResponse.data.token;
		expect(mockResponse.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // Validate JWT format

		
	});

	//retrieve all
	//retrieve specific user
	//retrieve user by username/id
	//user welcome
	
	//update a user's details
	
	//Delete a user
	test("DELETE /api/user/:username - should delete a user", async () => {

		const mockResponse = await axios.delete("http://localhost:5001/api/user/user/testuser");

		// console.log(mockResponse.data);
		expect(mockResponse.data).toEqual(mockUser);
	});
});
