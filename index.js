const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const http = require('http'); 
const socketIO = require('socket.io'); 
const MongoStore = require('connect-mongo');
const requestIp = require('request-ip');  

const app = express();
const server = http.createServer(app); 
const io = socketIO(server); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(requestIp.mw());  

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = 'mongodb+srv://Cosmik20:Reset2211@cluster0.18yvpzj.mongodb.net/userDB?retryWrites=true&w=majority';

const connectWithRetry = () => {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
      console.error('Error connecting to MongoDB Atlas, retrying...', err);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.use(session({
  secret: '9ououiuonoiunoiunoi,kbi',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    ttl: 14 * 24 * 60 * 60 
  })
}));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tokens: { type: Number, default: 0 },
  rojos: { type: [String], default: [] }, 
  messages: {
    type: [String],
    default: []
  },
  owner_access: { type: Boolean, default: false },
  panel_access: { type: Boolean, default: false },
  plus_access: { type: Boolean, default: false },
  banner: { type: String, default: '' },
  pfp: { type: String, default: '' },
  role: { type: String, default: 'User' },
  badges: { type: [String], default: [] },
  level: { type: Number, default: 1 },
  banned: { type: Boolean, default: false }, 
  muted: { type: Boolean, default: false },
  ip_address: { type: String, default: '' },
  blacklisted: { type: Boolean, default: false } 
});

const User = mongoose.model('User', userSchema);

const blacklistedUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ip_address: { type: String, required: true },
  blacklisted: { type: Boolean, default: true }
});

const BlacklistedUser = mongoose.model('BlacklistedUser', blacklistedUserSchema);

const rojos = [
  { name: "Octayden", rarity: "uncommon", cost: 500, quality: "high", imgUrl: "https://firebasestorage.googleapis.com/v0/b/cosmik-7c124.appspot.com/o/images%2Fblooks%2FOctayden%20(1).webp?alt=media&token=b27127c2-132a-4144-ac3e-dd5c371af89e" },
  { name: "Rojo 2", rarity: "rare", cost: 500, quality: "medium", imgUrl: "/images/rojo2.png" }
];

app.get('/rojos', (req, res) => {
  res.json(rojos);
});

app.post('/pay-tokens', async (req, res) => {
  const { username, rojoName } = req.body;

  try {
    const user = await User.findOne({ username });
    const selectedRojo = rojos.find(rojo => rojo.name === rojoName);

    if (!user || !selectedRojo) {
      return res.status(400).json({ error: 'Invalid user or rojo' });
    }

    if (user.tokens >= selectedRojo.cost) {
      user.tokens -= selectedRojo.cost;
      user.rojos.push(selectedRojo.name); 
      await user.save();
      res.json({ success: true, newTokenBalance: user.tokens, rojo: selectedRojo });
    } else {
      res.status(400).json({ error: 'Not enough tokens' });
    }
  } catch (err) {
    console.error('Error spending tokens:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const checkBlacklistedIp = async (req, res, next) => {
  const userIp = req.clientIp || 'Unknown IP';

  const blacklistedUser = await BlacklistedUser.findOne({ ip_address: userIp });
  if (blacklistedUser) {
    return res.status(403).send('This IP is associated with a blacklisted account. You cannot create an account or log in.');
  }

  next();
};


app.post('/signup', checkBlacklistedIp, async (req, res) => {
  try {
    const userIp = req.clientIp || 'Unknown IP'; 
    const existingUser = await User.findOne({ username: req.body.username });
    
    if (existingUser) {
      return res.status(400).send('Username already taken. Please choose another one.');
    }

    const blacklistedUserCheck = await BlacklistedUser.findOne({ username: req.body.username });
    if (blacklistedUserCheck) {
      return res.status(403).send('This username is blacklisted. You cannot create an account.');
    }

   
    const existingIpUser = await User.findOne({ ip_address: userIp });
    if (existingIpUser) {
      return res.status(403).send('An account associated with this IP address already exists.');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      tokens: req.body.tokens || 0,
      owner_access: req.body.owner_access || false,
      panel_access: req.body.panel_access || false,
      plus_access: req.body.plus_access || false,
      banner: req.body.banner || '',
      pfp: req.body.pfp || '',
      role: req.body.role || 'User',
      badges: req.body.badges || [],
      level: req.body.level || 1,
      banned: false,  // Default value
      muted: false,   // Default value
      ip_address: userIp,
      blacklisted: false  // Default value
    });

    await newUser.save();
    res.status(200).send('User signed up successfully!');

    if (newUser.blacklisted) {
      await BlacklistedUser.create({
        username: newUser.username,
        ip_address: newUser.ip_address,
        blacklisted: true
      });
    }
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).send('Error during sign-up.');
  }
});

app.get('/user', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ username: req.session.user.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      username: user.username,
      pfp: user.pfp,
      role: user.role,
      level: user.level,
      tokens: user.tokens,
      rojos: user.rojos, 
      badges: user.badges,
      banner: user.banner,
      banned: user.banned,
      muted: user.muted
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('newMessage', async (messageData) => {
    try {
      const user = await User.findOne({ username: messageData.username });

      if (!user) {
        socket.emit('error', 'User not found.');
        return;
      }

      if (user.banned || user.muted) {
        socket.emit('error', 'You are banned or muted and cannot send messages.');
        return;
      }

      io.emit('broadcastMessage', {
        username: messageData.username,
        message: messageData.message
      });
    } catch (error) {
      console.error('Error in newMessage event:', error);
      socket.emit('error', 'An error occurred.');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
app.post('/login', checkBlacklistedIp, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).send('Invalid username or password.');
    }

    if (user.banned) {
      return res.status(403).send('Your account is banned.');
    }

    if (user.blacklisted) {
      return res.status(403).send('Your account is blacklisted.');
    }

    if (await bcrypt.compare(req.body.password, user.password)) {
      req.session.user = {
        username: user.username,
        tokens: user.tokens,
        rojos: user.rojos,
        role: user.role,
        badges: user.badges,
        level: user.level,
        pfp: user.pfp
      };
      res.redirect('/stats');
    } else {
      res.status(401).send('Invalid username or password.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during login.');
  }
});
app.get('/chat', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});
app.get('/home', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/market', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'spend.html'));
});
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/stats', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});
app.get('/blooks', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'rojos.html'));
});

// Start server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});