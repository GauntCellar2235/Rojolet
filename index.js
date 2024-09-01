const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from 'public' directory

const usersFilePath = path.join(__dirname, 'info', 'users.json');

// Store connected users and their socket IDs
const connectedUsers = {};

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing users file:', parseErr);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        const user = users[username];
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, error: 'Internal server error' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Invalid username or password' });
            }

            res.status(200).json({ success: true, username });
        });
    });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Store the username with the socket ID
    socket.on('user connected', (username) => {
        connectedUsers[username] = socket.id;
        console.log(`${username} connected with socket ID ${socket.id}`);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);

        // Check for mentions in the message
        const mentionPattern = /@(\w+)/g;
        let match;
        while ((match = mentionPattern.exec(msg.text)) !== null) {
            const mentionedUsername = match[1];
            const mentionedSocketId = connectedUsers[mentionedUsername];

            if (mentionedSocketId) {
                // Emit a notification event to the mentioned user
                io.to(mentionedSocketId).emit('mention notification', { message: msg.text });
                console.log(`Mentioned ${mentionedUsername} with socket ID ${mentionedSocketId}`);
            }
        }
    });

    socket.on('disconnect', () => {
        // Remove disconnected users from the connected users list
        for (const [username, id] of Object.entries(connectedUsers)) {
            if (id === socket.id) {
                console.log(`${username} disconnected`);
                delete connectedUsers[username];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
