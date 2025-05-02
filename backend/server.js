const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const UserInfo = require('./models/UserInfo');
const { hashPassword, comparePassword } = require('./helpers/auth');
const Recipe = require('./models/Recipe');
const Like = require('./models/Like');
const Message = require('./models/Message');
const Cookbook = require('./models/Cookbook');
const Comment = require('./models/Comment');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Notification = require('./models/Notification');

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

const useApiPrefix = true; //true for dev false for server
const apiMount = useApiPrefix ? '/api' : '/';
const app2 = express.Router();

const PORT = 5000;
// End Set Up -----------------------------------------------------------
async function createNotification(type, fromUser, toUser, data = {}) {
  try {
    await Notification.create({ type, fromUser, toUser, data });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

app2.get('/test', (_req, res) => {
  res.json('Test successful.');
});

// Login/User Stuff ---------------------------------------------------------
app2.post('/register', async (req, res) => {
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

app2.post('/login', async (req, res) => {
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

app2.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app2.get('/profile/:username?', async (req, res) => {
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
          intolerances: user.userInfo.intolerances || [],
          isAdmin: user.username === process.env.ADMIN,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
      }
  });
});

app2.put('/profile/update', async (req, res) => {
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

app2.get('/search/users', async (req, res) => {
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
app2.post('/addFriend', async (req, res) => {
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

app2.put('/friends/remove', async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const userInfo = await UserInfo.findById(userId);
    const friendInfo = await UserInfo.findById(friendId);

    if (!userInfo || !friendInfo) {
      return res.status(404).json({ error: "User not found" });
    }

    userInfo.friends = userInfo.friends.filter(id => id.toString() !== friendId);
    friendInfo.friends = friendInfo.friends.filter(id => id.toString() !== userId);

    await userInfo.save();
    await friendInfo.save();

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

app2.get('/friends/:userId', async (req, res) => {
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

app2.post('/friend-request', async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const recipient = await UserInfo.findById(toId);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    if (recipient.friendRequests.some(id => id.toString() === fromId)) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    recipient.friendRequests.push(fromId);
    await recipient.save();
    await createNotification('friend_request', fromId, toId);

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app2.get('/friend-requests/:userInfoId', async (req, res) => {
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

app2.post('/friend-request/accept', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  console.log("Accepting Friend Request:", currentUserId, "<-", requesterId);
  try {
    const currentUser = await UserInfo.findById(currentUserId);
    const requester = await UserInfo.findById(requesterId);

    if (!currentUser || !requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const alreadyRequested = currentUser.friendRequests.some(id => id.toString() === requesterId);
    const alreadyFriends = currentUser.friends.includes(requesterId);

    if (!alreadyRequested || alreadyFriends) {
      return res.status(400).json({ error: 'Friend request already handled.' });
    }

    currentUser.friends.push(requesterId);
    requester.friends.push(currentUserId);
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    await currentUser.save();
    await requester.save();
    await createNotification('friend_accept', currentUserId, requesterId);

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: 'Server error..' });
  }
});

app2.post('/friend-request/deny', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  console.log("Denying Friend Request:", currentUserId, "<-", requesterId);

  try {
    const currentUser = await UserInfo.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const requestExists = currentUser.friendRequests.some(id => id.toString() === requesterId);
    if (!requestExists) {
      return res.status(400).json({ error: 'Request already denied or accepted.' });
    }

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

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.username !== process.env.ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

app2.use('/admin', verifyToken, requireAdmin);

app2.get('/admin/users', async (req, res) => {
  const { query } = req.query;
  const filter = query ? { username: { $regex: query, $options: 'i' }} : {};
  const users = await User.find(filter);
  res.json(users);
});

app2.delete('/admin/users/:userId', async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  await Comment.deleteMany({ userId });
  await Like.deleteMany({ userId });
  res.json({ message: 'User removed' });
});

app2.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'No user' });
  res.json({
    username: user.username,
    isAdmin: user.username === process.env.ADMIN
  });
});

app2.post('/cookbook', verifyToken, async (req, res) => {
  const { title, isPublic, coverImage } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for the cookbook' });
  }

  try {
    const newCookbook = new Cookbook({
      title,
      owners: [userId],
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

app2.get('/cookbook', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const cookbooks = await Cookbook.find({ owners: userId });
    res.status(200).json(cookbooks);
  } catch (err) {
    console.error('Error fetching cookbooks:', err);
    res.status(500).json({ error: 'Error fetching cookbooks' });
  }
});

app2.get('/cookbook/:id', verifyToken, async (req, res) => {
  const cookbookId = req.params.id;
  const userId = req.userId;

  try {
    const cookbook = await Cookbook.findOne({
      _id: cookbookId,
      $or: [
        { owners: userId },
        { isPublic: true }
      ]
    }).populate('recipes');

    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found or access denied' });
    }

    const isOwner = cookbook.owners
      .map(o => o.toString())
      .includes(userId);

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

app2.put('/cookbook/:id', async (req, res) => {
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

app2.post('/cookbook/:id/addRecipe', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { recipeId } = req.body;

  try {
    const cookbook = await Cookbook.findOne({ _id: id, owners: req.userId });
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found or not owned by you' });
    }

    if (cookbook.recipes.includes(recipeId)) {
      return res.status(409).json({ error: 'Recipe already in the cookbook' });
    }
    cookbook.recipes.push(recipeId);
    await cookbook.save();
    res.status(200).json({ message: 'Recipe added to cookbook' });
  } catch (err) {
    console.error('Error adding recipe to cookbook:', err);
    res.status(500).json({ error: 'Error adding recipe to cookbook' });
  }
});

app2.delete('/cookbook/:id/removeRecipe/:recipeId', verifyToken, async (req, res) => {
  const { id, recipeId } = req.params;
  const userId = req.userId;

  try {
    const cookbook = await Cookbook.findOne({ _id: id, owners: userId });

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

app2.get('/cookbooks/user/:username', verifyToken, async (req, res) => {
  const username = req.params.username;
  const requesterId = req.userId;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSameUser = user._id.toString() === requesterId;

    const filter = { owners: user._id };
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

app2.delete('/cookbook/:id', verifyToken, async (req, res) => {
  const cookbookId = req.params.id;
  const userId = req.userId;

  try {
      const cookbook = await Cookbook.findOne({ _id: cookbookId, owners: userId });
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

// Multiple owner stuff... ---------------------------------
app2.post('/cookbook/:id/share', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { toUserId } = req.body;
    if (!toUserId) {
      return res.status(400).json({ error: 'Must provide toUserId' });
    }

    const invitee = await User.findById(toUserId).select('userInfo');
    if (!invitee) {
      return res.status(404).json({ error: 'Invitee not found' });
    }

    const cookbook = await Cookbook.findById(id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }
    if (!cookbook.owners.map(o => o.toString()).includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to invite' });
    }
    if (cookbook.collaboratorRequests.includes(toUserId) ||
        cookbook.owners.includes(toUserId)
    ) {
      return res.status(400).json({ error: 'Already invited or owner' });
    }

    cookbook.collaboratorRequests.push(toUserId);
    await cookbook.save();

    const inviter = await User.findById(req.userId).select('userInfo');

    await createNotification(
      'cookbook_share_request',
      inviter.userInfo,
      invitee.userInfo,
      { cookbookId: id }
    );

    return res.json({ message: 'Share request sent' });
  } catch (err) {
    console.error('Error in share route:', err);
    return res.status(500).json({ error: 'Server error sending invite' });
  }
});

app2.post('/cookbook/:id/share/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cookbook = await Cookbook.findById(id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    if (!cookbook.collaboratorRequests.includes(req.userId)) {
      return res.status(400).json({ error: 'No pending invite' });
    }

    const inviterUserId = cookbook.owners[0].toString();
    cookbook.collaboratorRequests = cookbook.collaboratorRequests.filter(u => u !== req.userId);
    cookbook.owners.push(req.userId);
    await cookbook.save();
    const accepter = await User.findById(req.userId).select('userInfo');
    const inviter  = await User.findById(inviterUserId).select('userInfo');

    if (!inviter) {
      return res.status(404).json({ error: 'Original inviter not found' });
    }

    await createNotification(
      'cookbook_share_accept',
      accepter.userInfo,
      inviter.userInfo,
      { cookbookId: id }
    );

    return res.json({ message: 'You are now a co-owner' });
  } catch (err) {
    console.error('Error in accept route:', err);
    return res.status(500).json({ error: 'Server error accepting invite' });
  }
});

app2.post('/cookbook/:id/share/deny', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cookbook = await Cookbook.findById(id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    cookbook.collaboratorRequests = cookbook.collaboratorRequests
      .filter(r => r !== req.userId);
    await cookbook.save();

    res.json({ message: 'Invite denied' });
  } catch (err) {
    console.error('Error in deny route:', err);
    res.status(500).json({ error: 'Server error denying invite' });
  }
});

// Profile photo addition ----------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

app2.post('/upload', upload.fields([
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

app2.get('/profilePic/:userId', async (req, res) => {
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

app2.get('/coverImage/:userId', async (req, res) => {
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
app2.get('/messages/:id', verifyToken, async (req, res) => {
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

app2.post('/messages', verifyToken, async (req, res) => {
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

app2.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ username: user.username });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User-submitted recipe time lol---------------------------------------
app2.post('/recipes', verifyToken, async (req, res) => {
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
      const cookbook = await Cookbook.findOne({ _id: cookbookId, owners: [userId] });
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

app2.get('/my-recipes', verifyToken, async (req, res) => {
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

app2.get('/public-recipes', async (req, res) => {
  try {
    const publicRecipes = await Recipe.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('owner', 'username');

    const recipesWithImage = publicRecipes.map(r => ({
      ...r.toObject(),
      image: r.image ? r.image.toString('base64') : null,
    }));

    res.json(recipesWithImage);
  } catch (error) {
    console.error('Error fetching public recipes:', error);
    res.status(500).json({ error: 'Failed to fetch public recipes' });
  }
});

app2.get('/recipes/user/:username', async (req, res) => {
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

app2.get('/recipes/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe
      .findById(req.params.id)
      .populate('owner', 'username');

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const isOwner = recipe.owner._id.toString() === req.userId;
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

app2.put('/recipes/:id', verifyToken, async (req, res) => {
  const { isPublic } = req.body;
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, { isPublic }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app2.delete('/recipes/:id', verifyToken, async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

//Commenting on user recipes.
app2.post('/recipes/:id/comments', verifyToken, async (req, res) => {
  const { text } = req.body;
  const { id }   = req.params;

  try {
    const user = await User.findById(req.userId).populate('userInfo');
    const comment = await Comment.create({
      recipeId: id,
      userId:     user.userInfo._id,
      username:   user.username,
      text
    });

    let recipe;
    if (mongoose.Types.ObjectId.isValid(id)) {
      recipe = await Recipe.findById(id);
    }

    if (recipe?.isPublic) {
      const ownerUser   = await User.findById(recipe.owner).populate('userInfo');
      const ownerInfoId = ownerUser.userInfo._id.toString();
      const youId       = user.userInfo._id.toString();

      if (ownerInfoId !== youId) {
        await createNotification(
          'recipe_comment',
          user.userInfo._id,
          ownerInfoId,
          { recipeId: id, commentId: comment._id }
        );
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error("Failed to post comment:", err);
    res.status(500).json({ error: "Could not post comment" });
  }
});

app2.get('/recipes/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

app2.get('/recipes/:id/comments/count', async (req, res) => {
  try {
    const count = await Comment.countDocuments({ recipeId: req.params.id });
    res.json({ count });
  } catch (err) {
    console.error("Failed to get comment count:", err);
    res.status(500).json({ error: "Could not fetch comment count" });
  }
});

//Liking recipe time
app2.post('/recipes/:id/like', verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const isLocal = mongoose.Types.ObjectId.isValid(recipeId);

  try {
    const user = await User.findById(req.userId).populate('userInfo');

    const existing = await Like.findOne({ recipeId, userId: req.userId });
    let liked;
    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({ recipeId, userId: req.userId });
      liked = true;
    }

    if (liked && isLocal) {
      const recipe = await Recipe.findById(recipeId);
      if (recipe && recipe.isPublic) {
        const ownerUser = await User.findById(recipe.owner).populate('userInfo');
        const ownerInfoId = ownerUser.userInfo._id.toString();

        if (ownerInfoId !== user.userInfo._id.toString()) {
          await createNotification(
            'recipe_like',
            user.userInfo._id,
            ownerInfoId,
            { recipeId }
          );
        }
      }
    }

    const likeCount = await Like.countDocuments({ recipeId });
    res.json({ liked, likeCount });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

app2.get('/recipes/:id/likes', verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.userId;

  try {
    const liked = await Like.exists({ recipeId, userId });
    const likeCount = await Like.countDocuments({ recipeId });
    res.json({ liked: Boolean(liked), likeCount });
  } catch (err) {
    console.error("Error fetching like data:", err);
    res.status(500).json({ error: 'Failed to fetch like data' });
  }
});

//settings page start
app2.put('/settings/username', verifyToken, async (req, res) => {
  const { currentPassword, newUsername } = req.body;

  try {
    const user = await User.findById(req.userId);
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const existing = await User.findOne({ username: newUsername });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    user.username = newUsername;
    await user.save();
    res.json({ message: "Username updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update username" });
  }
});

app2.put('/settings/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const hashed = await hashPassword(newPassword);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: "Password update failed" });
  }
});

app2.put('/settings/intolerances', verifyToken, async (req, res) => {
  const { intolerances } = req.body;
  try {
    const user = await User.findById(req.userId).populate('userInfo');
    if (!user || !user.userInfo) return res.status(404).json({ error: "User not found" });

    user.userInfo.intolerances = intolerances;
    await user.userInfo.save();

    res.json({ message: "Intolerances updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Intolerance update failed" });
  }
});

app2.get('/admin/users', async (req, res) => {
  try {
    const { query, from, to } = req.query;
    const filter = {};

    if (query) {
      filter.username = { $regex: query, $options: 'i' };
    }

    const users = await User.find(filter)
    res.json(users);
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app2.delete('/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await Comment.deleteMany({ userId });
    await Like.deleteMany({ userId });
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error('Admin remove user error:', err);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app2.get('/admin/top-commented', async (req, res) => {
  try {
    const top = await Comment.aggregate([
      { $group: { _id: '$recipeId', commentCount: { $sum: 1 } } },
      { $sort: { commentCount: -1 } },
      { $limit: 5 },

      { $addFields: {
          recipeObjId: {
            $convert: {
              input: '$_id',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
      }},

      { $lookup: {
          from: 'recipes',
          localField: 'recipeObjId',
          foreignField: '_id',
          as: 'internal'
      }},
      { $unwind: { path: '$internal', preserveNullAndEmptyArrays: true } },

      { $project: {
          recipeId:    '$_id',
          commentCount: 1,
          title:       '$internal.title'
      }}
    ]);

    const key     = process.env.SPOONACULAR_KEY;
    const results = [];

    for (const item of top) {
      let title = item.title;
      if (!title && key) {
        await delay(200);
        try {
          const { data } = await axios.get(
            `https://api.spoonacular.com/recipes/${item.recipeId}/information`,
            { params: { apiKey: key } }
          );
          title = data.title;
        } catch (e) {
          console.warn(`Spoonacular lookup failed for ${item.recipeId}:`, e.message);
        }
      }
      results.push({
        recipeId:     item.recipeId,
        commentCount: item.commentCount,
        title:        title || `External ID: ${item.recipeId}`
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Admin top commented error:', err);
    res.status(500).json({ error: 'Failed to fetch top commented' });
  }
});

app2.get('/admin/top-liked', async (req, res) => {
  try {
    const top = await Like.aggregate([
      { $group: { _id: '$recipeId', likeCount: { $sum: 1 } } },
      { $sort: { likeCount: -1 } },
      { $limit: 5 },
      { $addFields: {
          recipeObjId: {
            $convert: { input: '$_id', to: 'objectId', onError: null, onNull: null }
          }
      }},
      { $lookup: {
          from: 'recipes',
          localField: 'recipeObjId',
          foreignField: '_id',
          as: 'internal'
      }},
      { $unwind: { path: '$internal', preserveNullAndEmptyArrays: true } },
      { $project: {
          recipeId: '$_id',
          likeCount: 1,
          title: '$internal.title'
      }}
    ]);

    const key = process.env.SPOONACULAR_KEY;
    const results = [];

    for (const item of top) {
      let title = item.title;
      if (!title && key) {
        await delay(200);
        try {
          const { data } = await axios.get(
            `https://api.spoonacular.com/recipes/${item.recipeId}/information`,
            { params: { apiKey: key } }
          );
          title = data.title;
        } catch (e) {
          console.warn(`Spoonacular fetch failed for ${item.recipeId}:`, e.message);
        }
      }
      results.push({
        recipeId: item.recipeId,
        likeCount: item.likeCount,
        title: title || `External ID: ${item.recipeId}`
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Admin top liked error:', err);
    res.status(500).json({ error: 'Failed to fetch top liked' });
  }
});

app2.get('/admin/spoonacular-popular', async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_KEY,
          sort: 'popularity',
          number: 5,
          addRecipeInformation: true
        }
      }
    );
    res.json(data.results.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image
    })));
  } catch (err) {
    console.error('Admin spoonacular error:', err);
    res.status(500).json({ error: 'Failed to fetch Spoonacular data' });
  }
});

//More realistic notification system time lol
app2.post('/notifications', async (req, res) => {
  try {
    const { type, fromUser, toUser, data } = req.body;
    const notif = await Notification.create({ type, fromUser, toUser, data });
    res.status(201).json(notif);
  } catch (err) {
    console.error("Notification create error:", err);
    res.status(500).json({ error: "Could not create notification" });
  }
});

app2.get('/notifications/:userInfoId', async (req, res) => {
  try {
    const notifs = await Notification
      .find({ toUser: req.params.userInfoId })
      .populate('fromUser', 'fName lName profilePic')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(notifs.map(async (notif) => {
      const userDoc = await User.findOne({ userInfo: notif.fromUser._id }).select('username');

      return {
        ...notif.toObject(),
        fromUser: {
          ...notif.fromUser.toObject(),
          username: userDoc?.username || 'unknown'
        }
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "Could not fetch notifications" });
  }
});

app2.put('/notifications/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (err) {
    console.error("Notification read error:", err);
    res.status(500).json({ error: "Could not update notification" });
  }
});

app2.delete('/notifications/:userInfoId', async (req, res) => {
  try {
    await Notification.deleteMany({ toUser: req.params.userInfoId });
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ error: "Could not clear notifications" });
  }
});

// Port that we're listening on -----------------------------------------
app.use(apiMount, app2);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));