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
});

module.exports = mongoose.model('UserInfo', UserInfoSchema);
