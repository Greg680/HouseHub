const io = require("socket.io-client");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Chat = require("../models/chatModel");
const setupSocket = require("../socket/socket.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

jest.setTimeout(30000);

describe("Socket.IO Chat Functionality Test", () => {
  let ioServer, httpServer, clientSocket;

  const validToken = jwt.sign(
    { userID: "user123", houseID: "house123", username: "testuser" },
    process.env.JWT_SECRET
  );
  const invalidToken = "invalidToken";

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for testing");

    // Deleting any existing test data
    await Chat.deleteMany({ userID: "user123" });

    // Create an HTTP server and Socket.IO server
    httpServer = createServer();
    ioServer = setupSocket(httpServer); // Use the setupSocket function
    
    // Start server and connect client
    await new Promise((resolve) => {
      httpServer.listen(() => {
        const port = httpServer.address().port;
        console.log(`Server listening on port ${port}`);
        
        clientSocket = io(`http://localhost:${port}`, {
          auth: { token: validToken },
        });
        
        clientSocket.on("connect", () => {
          console.log("Client connected to server");
          resolve();
        });
        
        clientSocket.on("connect_error", (err) => {
          console.error("Connection error:", err.message);
          resolve(); // error handeling for connection (was having a major problem with this)
        });
      });
    });
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
      console.log("Client socket disconnected");
    }
    
    // Clean up test data
    await Chat.deleteMany({ userID: "user123" });
    
    await mongoose.connection.close();

    
    if (ioServer) {
      ioServer.close();
    }
    
    if (httpServer) {
      httpServer.close();
    }
  });

  it("Should save message to db and emit it to all clients", (done) => {
    console.log("Starting test: Should save message to db and emit it to all clients");
    
    const timeoutId = setTimeout(() => {
      done(new Error("Test timed out - no newMessage event received"));
    }, 5000);
    
    // Event listener for newMessage
    clientSocket.once("newMessage", async (receivedMessage) => {
      clearTimeout(timeoutId);
      console.log("Received newMessage event:", receivedMessage);
      
      try {
        // Check that the message was broadcasted
        expect(receivedMessage.message).toBe("Test message");
        expect(receivedMessage.username).toBe("testuser");
        
        // Add delay to ensure DB write completes(was giving errors without this)
        await new Promise(r => setTimeout(r, 1000));
        
        // Check that the message was saved to the db
        const savedMessage = await Chat.findOne({ message: "Test message" });
        console.log("Database query result:", savedMessage);
        expect(savedMessage).toBeDefined();
        expect(savedMessage.message).toBe("Test message");
        done();
      } catch (error) {
        console.error("Error in message test:", error);
        done(error);
      }
    });

    // Emit the event
    const message = {
      message: "Test message"
    };
    clientSocket.emit("sendMessage", message);
  });
  it("Should reject empty messages", (done) => {
    console.log("Starting test: Should reject empty messages");

    const timeoutId = setTimeout(() => {
        done(new Error("Test timed out - no error event received"));
    }, 5000);

    // Set up listener for error event
    clientSocket.once("error", (errorMessage) => {
        clearTimeout(timeoutId);
        console.log("Received error event:", errorMessage);

        try {
            expect(errorMessage).toBe("Invalid message data");
            done();
        } catch (error) {
            console.error("Error in empty message test:", error);
            done(error);
        }
    });

    // Emit an empty message
    const emptyMessage = { message: "" };
    console.log("Emitting sendMessage event with empty message:", emptyMessage);
    clientSocket.emit("sendMessage", emptyMessage);
});

  it("Should reject unauthorised users who dont have a valid JWT", (done) => {
    
    const timeoutId = setTimeout(() => {
      done(new Error("Test timed out - no auth challenge received"));
    }, 5000);
    
    const unauthorisedSocket = io(
      `http://localhost:${httpServer.address().port}`,
      {
        auth: { token: invalidToken },
        reconnection: false
      }
    );

    unauthorisedSocket.on("connect", () => {
      clearTimeout(timeoutId);
      console.error("Unauthorized socket connected but should have been rejected");
      unauthorisedSocket.close();
      done(new Error("Unauthorized socket connected but should have been rejected"));
    });
    
    unauthorisedSocket.on("connect_error", (err) => {
      clearTimeout(timeoutId);
      console.log("Received connect_error:", err.message);
      try {
        expect(err.message).toBe("Authentication error");
        unauthorisedSocket.close();
        done();
      } catch (error) {
        console.error("Error in unauthorized test:", error);
        unauthorisedSocket.close();
        done(error);
      }
    });
  });
});