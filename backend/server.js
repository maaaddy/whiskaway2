const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const UserInfo = require('./models/UserInfo');
const { hashPassword, comparePassword } = require('./helpers/auth');
const Recipe = require('./models/Recipe');
const Message = require('./models/Message');
const Cookbook = require('./models/Cookbook');
const Comment = require('./models/Comment');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connection successful");
  }).catch((err) => {
    console.log("connection unsuccessful", err);
  });

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '10mb' })); // Allows JSON payloads up to 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));
app.use(cookieParser());

const PORT = 5000;
// End Set Up -----------------------------------------------------------

app.get('/api/test', (_req, res) => {
  res.json('Test successful.');
});

// Login/User Stuff ---------------------------------------------------------
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, fName, lName, bio, intolerances } = req.body;
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
      intolerances: Array.isArray(intolerances) ? intolerances : [],
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

app.post('/api/login', async (req, res) => {
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

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/profile/:username?', async (req, res) => {
  const { token } = req.cookies;
  const { username } = req.params;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decodedUser) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }

      try {
        let user;
        if (!username) {
            user = await User.findById(decodedUser.id).populate('userInfo');
        } else {
            user = await User.findOne({ username }).populate('userInfo');
        }

        if (!user || !user.userInfo) {
          return res.status(404).json({ error: "User or UserInfo not found" });
        }

        let profilePicBase64 = "";
        if (user.userInfo.profilePic) {
          profilePicBase64 = `data:image/jpeg;base64,${user.userInfo.profilePic.toString('base64')}`;
        }

        let coverImageBase64 = "";
        if (user.userInfo.coverImage) {
          coverImageBase64 = `data:image/jpeg;base64,${user.userInfo.coverImage.toString('base64')}`;
        }

        res.json({
          _id: user.userInfo._id.toString(),
          userId: user._id.toString(),
          username: user.username,
          userInfo: user.userInfo._id.toString(),
          fName: user.userInfo.fName,
          lName: user.userInfo.lName,
          bio: user.userInfo.bio,
          profilePic: profilePicBase64,
          coverImage: coverImageBase64,
          friends: user.userInfo.friends.length,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
      }
  });
});

app.put('/api/profile/update', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decodedUser) => {
      if (err) {
          return res.status(401).json({ error: "Invalid token" });
      }

      try {
          const user = await User.findById(decodedUser.id).populate('userInfo');
          if (!user || !user.userInfo) {
              return res.status(404).json({ error: "User not found" });
          }

          const { fName, lName, bio, profilePic, coverImage } = req.body;
          user.userInfo.fName = fName || user.userInfo.fName;
          user.userInfo.lName = lName || user.userInfo.lName;
          user.userInfo.bio = bio || user.userInfo.bio;

          if (profilePic) {
              const buffer = Buffer.from(profilePic.split(",")[1], "base64");
              user.userInfo.profilePic = buffer;
          }

          if (coverImage) {
            const buffer = Buffer.from(coverImage.split(",")[1], "base64");
            user.userInfo.coverImage = buffer;
        }

          await user.userInfo.save();
          res.json({ message: "Profile updated successfully" });

      } catch (error) {
          console.error("Error updating profile:", error);
          res.status(500).json({ error: "Failed to update profile" });
      }
  });
});

app.get('/api/search/users', async (req, res) => {
  const { query, currentUser } = req.query;

  if (!query) {
      return res.json([]);
  }

  try {
      const users = await User.find(
          { 
              username: { $regex: `^${query}`, $options: 'i', $ne: currentUser }
          }
      ).select("username").limit(5);
      res.json(users);
  } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Friends ------------------------------------------------------
app.post('/api/addFriend', async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const userInfo = await UserInfo.findById(userId);
    if (!userInfo) return res.status(404).json({ error: 'User not found' });

    if (!userInfo.friends.includes(friendId)) {
      userInfo.friends.push(friendId);
      await userInfo.save();
    }

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await UserInfo.findById(userId).populate('friends');
    if (!userInfo) return res.status(404).json({ error: 'UserInfo not found' });

    const userDocs = await User.find({ userInfo: { $in: userInfo.friends.map(f => f._id) } });

    const mergedFriends = await Promise.all(userDocs.map(async user => {
      const info = userInfo.friends.find(f => f._id.toString() === user.userInfo.toString());
    
      const latestMessage = await Message.findOne({
        $or: [
          { sender: userInfo._id, recipient: info._id },
          { sender: info._id, recipient: userInfo._id },
        ]
      }).sort({ createdAt: -1 });
    
      return {
        _id: user._id,
        username: user.username,
        userInfo: user.userInfo,
        fName: info?.fName || '',
        lName: info?.lName || '',
        bio: info?.bio || '',
        profilePic: info?.profilePic
          ? `data:image/jpeg;base64,${info.profilePic.toString('base64')}`
          : '',
        latestMessage: latestMessage
          ? { text: latestMessage.text, createdAt: latestMessage.createdAt }
          : null
      };
    }));

    res.json(mergedFriends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/friend-request', async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const recipient = await UserInfo.findById(toId);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    if (recipient.friendRequests.includes(fromId)) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    recipient.friendRequests.push(fromId);
    await recipient.save();

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/friend-requests/:userInfoId', async (req, res) => {
  try {
    const userInfo = await UserInfo.findById(req.params.userInfoId).populate('friendRequests');
    if (!userInfo) return res.status(404).json({ error: 'User not found' });

    const someRequests = await Promise.all(
      userInfo.friendRequests.map(async (requester) => {
        const user = await User.findOne({ userInfo: requester._id }).select('username');
        return {
          _id: requester._id,
          fName: requester.fName,
          lName: requester.lName,
          profilePic: requester.profilePic,
          username: user?.username || ''
        };
      })
    );

    res.json(someRequests);
  } catch (err) {
    console.error('Get friend requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/friend-request/accept', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  try {
    const currentUser = await UserInfo.findById(currentUserId);
    const requester = await UserInfo.findById(requesterId);

    if (!currentUser || !requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.friends.includes(requesterId)) {
      currentUser.friends.push(requesterId);
    }

    if (!requester.friends.includes(currentUserId)) {
      requester.friends.push(currentUserId);
    }

    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    await currentUser.save();
    await requester.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: 'Server error..' });
  }
});

app.post('/api/friend-request/deny', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  try {
    const currentUser = await UserInfo.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    await currentUser.save();
    res.json({ message: 'Friend request denied' });
  } catch (err) {
    console.error('Error denying request:', err);
    res.status(500).json({ error: 'Server error..' });
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

app.post('/api/cookbook', verifyToken, async (req, res) => {
    const { title, isPublic, coverImage } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for the cookbook' });
  }

  try {
    const newCookbook = new Cookbook({
      title,
      owner: userId,
      isPublic: isPublic || false,
      coverImage: coverImage || 'cover5.JPG',
    });
    await newCookbook.save();
    res.status(201).json(newCookbook);
  } catch (err) {
    console.error('Error creating cookbook:', err);
    res.status(500).json({ error: 'Error creating cookbook' });
  }
});

app.get('/api/cookbook', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const cookbooks = await Cookbook.find({ owner: userId });
    res.status(200).json(cookbooks);
  } catch (err) {
    console.error('Error fetching cookbooks:', err);
    res.status(500).json({ error: 'Error fetching cookbooks' });
  }
});

app.get('/api/cookbook/:id', verifyToken, async (req, res) => {
  const cookbookId = req.params.id;
  const userId = req.userId;

  try {
    const cookbook = await Cookbook.findOne({
      _id: cookbookId,
      $or: [
        { owner: userId },
        { isPublic: true }
      ]
    }).populate('recipes');

    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found or access denied' });
    }

    const isOwner = cookbook.owner.toString() === userId;
    const validRecipes = cookbook.recipes.filter(Boolean);

    const filteredRecipes = validRecipes.filter(recipe => {
      if (typeof recipe === 'string') return true;
      if (isOwner) return true;
      return recipe.isPublic;
    });

    res.status(200).json({
      ...cookbook.toObject(),
      recipes: filteredRecipes.map(r => (typeof r === 'object' ? r._id : r))
    });
  } catch (err) {
    console.error('Error fetching cookbook:', err);
    res.status(500).json({ error: 'Error fetching cookbook' });
  }
});

app.put('/api/cookbook/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { isPublic } = req.body;

      const updatedCookbook = await Cookbook.findByIdAndUpdate(id, { isPublic }, { new: true });

      if (!updatedCookbook) {
          return res.status(404).json({ error: "Cookbook not found" });
      }

      res.json(updatedCookbook);
  } catch (error) {
      console.error("Error updating cookbook privacy:", error);
      res.status(500).json({ error: "Failed to update cookbook" });
  }
});

app.post('/api/cookbook/:id/addRecipe', verifyToken, async (req, res) => {
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

app.delete('/api/cookbook/:id/removeRecipe/:recipeId', verifyToken, async (req, res) => {
  const { id, recipeId } = req.params;
  const userId = req.userId;

  try {
    const cookbook = await Cookbook.findOne({ _id: id, owner: userId });

    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found or unauthorized' });
    }

    cookbook.recipes = cookbook.recipes.filter(r => r.toString() !== recipeId);
    await cookbook.save();

    res.status(200).json({ message: 'Recipe removed from cookbook' });
  } catch (err) {
    console.error('Error removing recipe:', err);
    res.status(500).json({ error: 'Error removing recipe from cookbook' });
  }
});

app.get('/api/cookbooks/user/:username', verifyToken, async (req, res) => {
  const username = req.params.username;
  const requesterId = req.userId;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSameUser = user._id.toString() === requesterId;

    const filter = { owner: user._id };
    if (!isSameUser) {
      filter.isPublic = true;
    }

    const cookbooks = await Cookbook.find(filter).populate('recipes');
    res.status(200).json(cookbooks);
  } catch (err) {
    console.error('Error fetching cookbooks:', err);
    res.status(500).json({ error: 'Error fetching cookbooks' });
  }
});

app.delete('/api/cookbook/:id', verifyToken, async (req, res) => {
  const cookbookId = req.params.id;
  const userId = req.userId;

  try {
      const cookbook = await Cookbook.findOne({ _id: cookbookId, owner: userId });
      if (!cookbook) {
          return res.status(404).json({ error: 'Cookbook not found or not owned by you' });
      }

      await Cookbook.findByIdAndDelete(cookbookId);
      res.status(200).json({ message: 'Cookbook deleted successfully' });
  } catch (err) {
      console.error('Error deleting cookbook:', err);
      res.status(500).json({ error: 'Error deleting cookbook' });
  }
});

// Profile photo addition ----------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  const { userId } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid user ID' });
  }

  try {
    const userInfo = await UserInfo.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ msg: 'UserInfo not found' });
    }

    if (req.files.profilePic) {
      userInfo.profilePic = req.files.profilePic[0].buffer;
    }
    if (req.files.coverImage) {
      userInfo.coverImage = req.files.coverImage[0].buffer;
    }

    await userInfo.save();
    return res.json({ msg: 'Upload successful', userInfo });
  } catch (err) {
    console.error('Error uploading image:', err);
    return res.status(500).json({ msg: 'Error uploading image' });
  }
});

app.get('/api/profilePic/:userId', async (req, res) => {
  try {
      const userInfo = await UserInfo.findById(req.params.userId);
      if (!userInfo || !userInfo.profilePic) {
          return res.status(404).send('Profile picture not found');
      }

      res.contentType('image/jpeg');
      res.send(userInfo.profilePic);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching profile picture');
  }
});

app.get('/api/coverImage/:userId', async (req, res) => {
  try {
    const userInfo = await UserInfo.findById(req.params.userId);
    if (!userInfo || !userInfo.coverImage) {
      return res.status(404).send('Cover image not found');
    }

    res.contentType('image/jpeg');
    res.send(userInfo.coverImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching cover image');
  }
});

// Attempt at chat part! -----------------------------------------
app.get('/api/messages/:id', verifyToken, async (req, res) => {
  const userId = req.userId;
  const otherUserInfoId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    const myUserInfoId = user.userInfo.toString();

    const messages = await Message.find({
      $or: [
        { sender: myUserInfoId, recipient: otherUserInfoId },
        { sender: otherUserInfoId, recipient: myUserInfoId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/api/messages', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { recipient, text } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.userInfo) {
      console.log("No user or userInfo found");
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await Message.create({
      sender: user.userInfo,
      recipient,
      text
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// User-submitted recipe time lol---------------------------------------
app.post('/api/recipes', verifyToken, async (req, res) => {
  try {
    const {
      title,
      image,
      instructions,
      ingredients,
      prepTime,
      cookTime,
      servings,
      link,
      tags,
      isPublic,
      cookbookId
    } = req.body;

    const userId = req.userId;
    const existingCount = await Recipe.countDocuments({ owner: userId });

    const newRecipe = new Recipe({
      title,
      image: image ? Buffer.from(image.split(',')[1], 'base64') : undefined,
      instructions,
      ingredients,
      prepTime,
      cookTime,
      servings,
      link,
      mealType: tags.mealType?.map(t => t.value),
      cuisine: tags.cuisine?.map(t => t.value),
      diet: tags.diet?.map(t => t.value),
      intolerance: tags.intolerance?.map(t => t.value),
      isPublic,
      owner: userId,
      index: existingCount + 1
    });

    await newRecipe.save();

    if (cookbookId) {
      const cookbook = await Cookbook.findOne({ _id: cookbookId, owner: userId });
      if (cookbook && !cookbook.recipes.includes(newRecipe._id)) {
        cookbook.recipes.push(newRecipe._id);
        await cookbook.save();
      }
    }

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.get('/api/my-recipes', verifyToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.userId }).sort({ index: 1 });

    const recipesWithImage = recipes.map(recipe => {
      const imageBase64 = recipe.image
        ? recipe.image.toString('base64')
        : null;

      return {
        ...recipe.toObject(),
        image: imageBase64
      };
    });

    res.status(200).json(recipesWithImage);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const publicRecipes = await Recipe.find({ 
      owner: user._id, 
      isPublic: true 
    }).sort({ index: 1 });
    const recipesWithImage = publicRecipes.map(recipe => {
      const imageBase64 = recipe.image
        ? recipe.image.toString('base64')
        : null;

      return {
        ...recipe.toObject(),
        image: imageBase64
      };
    });

    res.status(200).json(recipesWithImage);
  } catch (error) {
    console.error('Error fetching public recipes by username:', error);
    res.status(500).json({ error: 'Failed to fetch public recipes' });
  }
});

app.get('/api/recipes/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const isOwner = recipe.owner.toString() === req.userId;

    if (!recipe.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized to view this recipe' });
    }

    const imageBase64 = recipe.image
      ? recipe.image.toString('base64')
      : null;

    res.status(200).json({
      ...recipe.toObject(),
      image: imageBase64,
    });
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

app.put('/api/recipes/:id', verifyToken, async (req, res) => {
  const { isPublic } = req.body;
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, { isPublic }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', verifyToken, async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

//Commenting on user recipes.
app.post('/api/recipes/:id/comments', verifyToken, async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    const comment = await Comment.create({
      recipeId: id,
      userId: user._id,
      username: user.username,
      text
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Failed to post comment:", err);
    res.status(500).json({ error: "Could not post comment" });
  }
});

app.get('/api/recipes/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

app.get('/api/recipes/:id/comments/count', async (req, res) => {
  try {
    const count = await Comment.countDocuments({ recipeId: req.params.id });
    res.json({ count });
  } catch (err) {
    console.error("Failed to get comment count:", err);
    res.status(500).json({ error: "Could not fetch comment count" });
  }
});

// Port that we're listening on -----------------------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));