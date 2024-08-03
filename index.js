const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from 'public' directory

const usersFilePath = path.join(__dirname, 'info', 'users.json');

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        const users = JSON.parse(data);

        const user = users[username];
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        res.status(200).json({ success: true, username });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
