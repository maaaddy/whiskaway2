const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const UserInfo = require('./models/UserInfo');
const { hashPassword, comparePassword } = require('./helpers/auth');
const Recipe = require('./models/Recipe');
const Cookbook = require('./models/Cookbook');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connection successful");
  }).catch((err) => {
    console.log("connection unsuccessful", err);
  });

const app = express();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));
app.use(cookieParser());

const PORT = 5000;
// End Set Up -----------------------------------------------------------

app.get('/test', (_req, res) => {
  res.json('Test successful.');
});

// Login/User Stuff ---------------------------------------------------------
app.post('/register', async (req, res) => {
  try {
    const { username, password, fName, lName, bio } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await hashPassword(password);
    const userInfo = await UserInfo.create({
      fName,
      lName,
      bio,
      friends: [],
    });

    const user = await User.create({
      username,
      password: hashedPassword,
      userInfo: userInfo._id,
    });

    jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        res
          .cookie('token', token, { httpOnly: true })
          .status(201)
          .json({
            id: user._id,
            username: user.username,
            userInfo,
          });
      }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).populate('userInfo');

    if (!user) {
      return res.status(400).json({ error: 'No user found' });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect credentials.' });
    }

    jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_SECRET, {},
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json(user);
      }
    );
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/profile', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json(null);
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decodedUser) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const user = await User.findById(decodedUser.id).populate('userInfo');
      res.json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });
});

// Friends ------------------------------------------------------
app.post('/addFriend', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const userInfo = await UserInfo.findOne({ _id: userId });
    const friendInfo = await UserInfo.findOne({ _id: friendId });

    if (!userInfo || !friendInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userInfo.friends.includes(friendId)) {
      userInfo.friends.push(friendId);
      await userInfo.save();
    }

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await UserInfo.findById(userId).populate('friends');

    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userInfo.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Cookbook stuff.. --------------------------------------------------
const verifyToken = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'No token no authorization...' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decodedUser.id;
    next();
  });
};

app.post('/cookbook', verifyToken, async (req, res) => {
  const { title } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for the cookbook' });
  }

  try {
    const newCookbook = new Cookbook({ title, owner: userId });
    await newCookbook.save();
    res.status(201).json(newCookbook);
  } catch (err) {
    console.error('Error creating cookbook:', err);
    res.status(500).json({ error: 'Error creating cookbook' });
  }
});

app.get('/cookbook', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const cookbooks = await Cookbook.find({ owner: userId });
    res.status(200).json(cookbooks);
  } catch (err) {
    console.error('Error fetching cookbooks:', err);
    res.status(500).json({ error: 'Error fetching cookbooks' });
  }
});

app.get('/cookbook/:id', verifyToken, async (req, res) => {
  const cookbookId = req.params.id;
  const userId = req.userId;

  try {
    const cookbook = await Cookbook.findOne({ _id: cookbookId, owner: userId }).populate('recipes');
    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found or not owned by you' });
    }

    res.status(200).json(cookbook);
  } catch (err) {
    console.error('Error fetching cookbook:', err);
    res.status(500).json({ error: 'Error fetching cookbook' });
  }
});

app.post('/cookbook/:id/addRecipe', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { recipeId } = req.body;

  try {
    const cookbook = await Cookbook.findOne({ _id: id, owner: req.userId });
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found or not owned by you' });
    }

    if (cookbook.recipes.includes(recipeId)) {
      return res.status(400).json({ error: 'Recipe already in the cookbook' });
    }
    cookbook.recipes.push(recipeId);
    await cookbook.save();
    res.status(200).json({ message: 'Recipe added to cookbook' });
  } catch (err) {
    console.error('Error adding recipe to cookbook:', err);
    res.status(500).json({ error: 'Error adding recipe to cookbook' });
  }
});

// Port that we're listening on -----------------------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));