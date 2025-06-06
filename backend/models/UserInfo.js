const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
    },
    lName: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: '',
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
    }],
    friendRequests: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserInfo',
    }],
    profilePic: {
        type: Buffer,
    },
    coverImage: {
        type: Buffer,
    },
    intolerances: {
        type: [String],
        default: [],
    }
});

module.exports = mongoose.model('UserInfo', UserInfoSchema);
