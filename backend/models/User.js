const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: async function (value) {
                const user = await this.constructor.findOne({ username: value });
                return !user;
            },
            message: 'Username already exists',
        },
    },
    password: {
        type: String,
        required: true,
    },
    fName: {
        type: String,
        required: true, //I want all users to have a first name so it displays on the profile. 
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
        ref: 'User',
    }],
});

module.exports = mongoose.model('User', UserSchema);
