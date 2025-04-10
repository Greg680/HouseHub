const socketIo = require('socket.io');
const chat = require('../models/chatModel');
const socketAuthorise = require('../middleware/authoriseSocketMiddleware.js');

function setupSocket(server) {
    const io = socketIo(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware for authentication h
    io.use(socketAuthorise);

    //Handeling incoming connections
    io.on('connection', (socket) => {
        console.log('A user connected');

        if (socket.user && socket.user.houseID) {
            const houseID = socket.user.houseID;
            socket.join(houseID);
            console.log(`User ${socket.user.username} auto-joined house: ${houseID}`);

            // Load chat history for user
            loadChatHistory(socket, houseID).catch(err => {
                console.error('Error loading chat history:', err);
                socket.emit('error', 'Failed to load chat history');
            });


            // Notify others of join
            socket.to(houseID).emit('userJoined', {
                userID: socket.user.userID,
                message: `${socket.user.username} has joined the chatt`,
            });
        }

        //join a house
        socket.on('joinHouse', async (houseID) => {
            socket.join(houseID);
            console.log(`User joined house: ${houseID}`);

            // Load chat history for the house and emit it to the user
            try {
                //Alert other users in the chat who joined
                socket.to(houseID).emit('userJoined', {
                    userID: socket.user.userID,
                    message: `${socket.user.username} has joined the chat`,
                });
                await loadChatHistory(socket, houseID); // Load chat history from house
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        });
        socket.on('leaveHouse', (houseID) => {
            socket.leave(houseID);
            console.log(`User left house: ${houseID}`);

            //notify other users in the chat who left
            socket.to(houseID).emit('userLeft', {
                userID: socket.user.userID,
                message: `${socket.user.username} has left the chat`,
            });
        });

        //Sending a message
        socket.on('sendMessage', async (messageData) => {
            try {
                console.log('Message data:', messageData); // Log the message data for debugging
                const { message } = messageData;

                //take userID, username and houseID from socket
                const userID = socket.user.userID;
                const username = socket.user.username;
                const houseID = socket.user.houseID;

                //Validate house
                if (!houseID) {
                    socket.emit('error', 'You are not in a house');
                    return;
                }

                //Creating new message
                const newMessage = new chat({
                    houseID,
                    userID,
                    username,
                    message,
                });
                //Saving message to DB
                const savedMessage = await newMessage.save();

                //Emitting message to all users in the house
                io.to(houseID).emit('newMessage', {
                    username,
                    message,
                    timestamp: savedMessage.timestamp,
                })
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });
        //Showing a user is typing 
        socket.on('typing', () => {
            const houseID = socket.user.houseID;
            if (houseID) {
                socket.to(houseID).emit('userTyping', {
                    userID: socket.user.userID,
                    username: socket.user.username,
                });
            }
        });
        //Showing a user is not typing anymore
        socket.on('stopTyping', (houseID) => {
            socket.to(houseID).emit('userStopTyping', {
                userID: socket.user.userID,
                username: socket.user.username,
            });
        });

        //disconnecting user
        socket.on('disconnect', () => {
            if (!socket.user) {
                console.log('User disconnected without authentication');
                return; // Check if user data is available
            }
            console.log('A user disconnected', socket.user.userID);

            if (socket.user.houseID) {
                // Notify other users in the house that this user has disconnected
                io.to(socket.user.houseID).emit('userDisconnected', {
                    username: socket.user.username,
                    message: `${socket.user.username} has disconnected`,
                });
            }
        });
    });
    return io;
}
async function loadChatHistory(socket, houseID) {
    try {
        // Query to find old messages
        const messages = await chat.find({ houseID })
            .sort({ timestamp: -1 })
            .limit(50);

        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            message: msg.message,
            username: msg.username || (msg.userID === socket.user.userID ? socket.user.username : 'Other User'),
            timestamp: msg.timestamp
        }));

        // Send messages to joined user
        socket.emit('chatHistory', formattedMessages.reverse());
    } catch (error) {
        console.error('Error loading chat history:', error);
        socket.emit('error', 'Failed to load chat history');
    }
}

module.exports = setupSocket;