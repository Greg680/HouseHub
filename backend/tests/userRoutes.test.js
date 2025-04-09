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
let token = null;
let mockUser = {};
let mockResponse = {};
//By André Pont 
describe("Testing the registration route", () => {
	//Creating a user by registrating
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
		expect(mockResponse.status).toBe(201);
	});

	//Try to register a user with the same username
	test("registration - repeated username no new user expected", async () => {
		try {
			await axios.post("http://localhost:5001/api/user/registration", { 
				username: "testuser",
				firstName: "Test",
				lastName: "User",
				email: "test@example.com",
				age: "25",
				password: "password",
				role: "tenant",
			});
		} catch (error) {
			expect(error.response.status).toBe(500);
		}
	});

	//Try to register a user with no details
	test("registration - No details defined, expected error", async () => {
		try {
			await axios.post("http://localhost:5001/api/user/registration", { 
				username: "testuser123",
				// firstName: "Test",
				// lastName: "User",
				// email: "test@example.com",
				// age: "25",
				password: "password",
				// role: "tenant",
			});
		} catch (error) {
			expect(error.response.status).toBe(500);
		}
	});

	//Try to register a user with a short password
	test("Registration - Short password case", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/registration",{ 
				username: "testuser",
				firstName: "Test",
				lastName: "User",
				email: "test@example.com",
				age: "25",
				password: "pas",
				role: "tenant",
			});
		} catch (error) {
			expect(error.response.status).toBe(500);
		}
	});

	//Try to register a user with a short username
	test("Registration - Short username case", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/registration",{ 
			username: "te",
			firstName: "Test",
			lastName: "User",
			email: "test@example.com",
			age: "25",
			password: "password",
			role: "tenant",
			});
		} catch (error) {
			expect(error.response.status).toBe(500);
		}
	});

	//Try to register a user with a long username
	test("Registration - Long username case", async () => {
		try {
			await axios.post("http://localhost:5001/api/user/registration", { 
				username: "testuser12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
				firstName: "Test",
				lastName: "User",
				email: "test@example.com",
				age: "25",
				password: "password",
				role: "tenant",
			});
		} catch (error) {
			expect(error.response.status).toBe(500); // Access the status from the error response
		}
	});
});

//André Pont
describe("Testing the update user's houseID route", () => {
	//Update a user's houseID
	test("PUT /api/user/:username - should update a user's houseID", async () => {

		const mockResponse = await axios.put("http://localhost:5001/api/user/user/testuser", {
			houseID: "50962f35-4c81-43aa-b97e-411548ff552e",
		});

		// console.log(mockResponse.data);
		mockUser = mockResponse.data;
		expect(mockResponse.data.houseID).toBe("50962f35-4c81-43aa-b97e-411548ff552e");
	});

	test("/user/:username - Invalid houseID case", async () => {
		try{
			await axios.put("http://localhost:5001/api/user/user/testuser", {
				houseID: "invalid-house-id",
			});
		}catch (error) {
			expect(error.response.status).toBe(400);
		}
	});

	test("/user/:username - Invalid username case", async () => {
		try{
			await axios.put("http://localhost:5001/api/user/user/testu", {
				houseID: "50962f35-4c81-43aa-b97e-411548ff552e",
			});
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	test("/user/:username - Invalid body case", async () => {
		try{
			await axios.put("http://localhost:5001/api/user/user/testuser", {
				invalID:"This is a test",
			});
		}catch (error) {
			expect(error.response.status).toBe(400);
		}
	});

});

//André Pont
describe("Testing the log-in route", () => {
	//Loging in
	test("POST /api/login - should log in a user", async () => {
		const mockResponse = await axios.post("http://localhost:5001/api/user/login", {
			username: "testuser",
			password: "password",
		});

		token = mockResponse.data.token;
		expect(mockResponse.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // Validate JWT format
	});

	test("login - Wrong password scenario", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/login", {
				username: "testuser",
				password: "pass",
			});
		}catch (error) {
			expect(error.response.status).toBe(400);
		}
	});

	test("login - Wrong username scenario", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/login", {
				username: "tetuse",
				password: "password",
			});
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	test("login - No body scenario", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/login", {
			});
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	test("login - Invalid body scenario", async () => {
		try{
			await axios.post("http://localhost:5001/api/user/login", {
				theusername: "testuser",
				thepassword: "password",
			});
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

});

async function createUser() {
	mockResponse = await axios.post("http://localhost:5001/api/user/registration",{ 
		username: "testuser",
		firstName: "Test",
		lastName: "User",
		email: "test@example.com",
		age: "25",
		password: "password",
		role: "tenant",
	});
}

//André Pont
describe("Testing the delete user route", () => {

	test("Delete - Invalid username scenario", async () => {
		try{
			await axios.delete("http://localhost:5001/api/user/user/testuser");
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	test("Delete - Invalid body scenario (should delete a user)", async () => {
		try {
			const theResponse = await axios.delete("http://localhost:5001/api/user/user/testuser");
			expect(theResponse.data).toEqual(mockUser); // Expect the response to match mockUser if successful
		} catch (error) {
			expect(error.response.status).toBe(404); // Expect a 404 if the user does not exist
		}
	});

	//Delete a user
	test("DELETE /api/user/:username - should delete a user", async () => {
		await createUser();
		const mockDel = await axios.delete("http://localhost:5001/api/user/user/testuser");
		expect(mockResponse.data.username).toEqual(mockDel.username);
	});

	test("Delete - Already deleted user scenario", async () => {
		try{
			theResponse = await axios.delete("http://localhost:5001/api/user/user/testuser");
		}catch (error) {
			expect(error.response.status).toBe(404);
		}
	});
});




	//retrieve all
	//retrieve specific user
	//retrieve user by username/id
	//user welcome
	
	//update a user's details
