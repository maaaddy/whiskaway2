const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const {hashPassword, comparePassword} = require('./helpers/auth')
const Recipe = require('./models/Recipe');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connection successful")
  }).catch((err) => {
    console.log("connection unsuccessful", err)
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

// Recipe Stuff ---------------------------------------------------------
app.post('/recipes', async (req, res) => {
  const{title, servings} = req.body;
  const newRecipe = await Recipe.create({title, servings}); 
  console.log(req);
  res.json(newRecipe);
});

app.get('/findrecipes', async (_req, res) => {
  try {
      const recipeInfo = await Recipe.find({}, { _id: 1, title: 1, servings: 1});
      res.json(recipeInfo);
  } catch (err) {
      console.error("Error:", err);
      res.status(500).send("No data here!");
  }
});

app.put('/recipe/update', async (req, res) => {
  try {
    const { title, servings, _id } = req.body;
    console.log("Received Update Request:", req.body);

    const recipe = await Recipe.findById(_id);
    if (recipe) {
      recipe.title = title;
      recipe.servings = servings;
      const updatedRecipe = await recipe.save();
      res.json(updatedRecipe);
    } else {
      res.status(404).send("No recipe found");
    }
  } catch (err) {
    console.error("Error in /recipe/update:", err);
    res.status(500).send("Update unsuccessful");
  }
});

app.delete('/recipe/delete', async (req, res) => {
    try {
        const { _id } = req.query;
        if (!_id) {
            return res.status(400).send({ message: 'Recipe ID is required' });
        }
        await Recipe.deleteOne({ _id });
        res.status(200).send({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error deleting recipe' });
    }
});

// Login/User Stuff ---------------------------------------------------------
app.post('/register', async (req, res) => {
  try {
    const { username, password, fName, lName, bio } = req.body;
    if (!username) {
      return res.json({
        error: 'Username required',
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: 'Password required and should be at least 6 characters long',
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      username,
      password: hashedPassword,
      fName,
      lName,
      bio,
      friends: [],
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
            fName: user.fName,
            lName: user.lName,
            bio: user.bio,
            friends: user.friends,
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
      const {username, password} = req.body;
      const user = await User.findOne({username});
      if(!user){
        return res.json({
          error: 'No user found'
        });
      }
      const match = await comparePassword(password, user.password);
      if(!match){
        return res.json({
          error: 'Incorrect credentials.'
        });
      } else {
          jwt.sign({username: user.username, id: user._id},process.env.JWT_SECRET, {}, (err, token) => {
            if(err) throw err;
            res.cookie('token', token).json(user)
          });
      }
  } catch (error) {
    console.log(error);
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
      const user = await User.findById(decodedUser.id).select('-password');
      res.json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });
});

// Port that we're listening on -----------------------------------------
const server = app.listen(5000);