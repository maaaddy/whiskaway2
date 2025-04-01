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

app.get('/profile/:username?', async (req, res) => {
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

        res.json({
          _id: user.userInfo._id.toString(),
          username: user.username,
          userInfo: user.userInfo._id.toString(),
          fName: user.userInfo.fName,
          lName: user.userInfo.lName,
          bio: user.userInfo.bio,
          profilePic: profilePicBase64,
          friends: user.userInfo.friends.length,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
      }
  });
});

app.put('/profile/update', async (req, res) => {
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

          const { fName, lName, bio, profilePic } = req.body;
          user.userInfo.fName = fName || user.userInfo.fName;
          user.userInfo.lName = lName || user.userInfo.lName;
          user.userInfo.bio = bio || user.userInfo.bio;

          if (profilePic) {
              const buffer = Buffer.from(profilePic.split(",")[1], "base64");
              user.userInfo.profilePic = buffer;
          }

          await user.userInfo.save();
          res.json({ message: "Profile updated successfully" });

      } catch (error) {
          console.error("Error updating profile:", error);
          res.status(500).json({ error: "Failed to update profile" });
      }
  });
});

app.get('/search/users', async (req, res) => {
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
app.post('/addFriend', async (req, res) => {
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

app.get('/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await UserInfo.findById(userId).populate('friends');
    if (!userInfo) return res.status(404).json({ error: 'UserInfo not found' });

    const userDocs = await User.find({ userInfo: { $in: userInfo.friends.map(f => f._id) } });

    const mergedFriends = userDocs.map(user => {
      const info = userInfo.friends.find(f => f._id.toString() === user.userInfo.toString());
      return {
        _id: user._id,
        username: user.username,
        userInfo: user.userInfo,
        fName: info?.fName || '',
        lName: info?.lName || '',
        bio: info?.bio || ''
      };
    });

    res.json(mergedFriends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/friend-request', async (req, res) => {
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

app.get('/friend-requests/:userInfoId', async (req, res) => {
  try {
    const userInfo = await UserInfo.findById(req.params.userInfoId).populate('friendRequests');
    if (!userInfo) return res.status(404).json({ error: 'User not found' });

    res.json(userInfo.friendRequests);
  } catch (err) {
    console.error('Get friend requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/friend-request/accept', async (req, res) => {
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

app.post('/friend-request/deny', async (req, res) => {
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

app.post('/cookbook', verifyToken, async (req, res) => {
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

app.put('/cookbook/:id', async (req, res) => {
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

app.get('/cookbooks/user/:username', verifyToken, async (req, res) => {
  const username = req.params.username;
  const userId = req.userId;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cookbooks = await Cookbook.find({ owner: user._id }).populate('recipes');
    res.status(200).json(cookbooks);
  } catch (err) {
    console.error('Error fetching cookbooks:', err);
    res.status(500).json({ error: 'Error fetching cookbooks' });
  }
});

app.delete('/cookbook/:id', verifyToken, async (req, res) => {
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
const upload = multer({ storage: storage });

app.post('/upload', upload.single('profilePic'), async (req, res) => {
  const { userId } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
  }

  try {
      const userInfo = await UserInfo.findById(userId);
      if (!userInfo) {
          return res.status(404).json({ msg: 'UserInfo not found' });
      }

      userInfo.profilePic = req.file.buffer;
      await userInfo.save();
      return res.json({ msg: 'Upload successful', userInfo });
  } catch (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ msg: 'Error uploading image' });
  }
});

app.get('/profilePic/:userId', async (req, res) => {
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

// Attempt at chat part! -----------------------------------------
app.get('/messages/:id', verifyToken, async (req, res) => {
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

app.post('/messages', verifyToken, async (req, res) => {
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

// Port that we're listening on -----------------------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));