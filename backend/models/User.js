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
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true,
    },
});

module.exports = mongoose.model('User', UserSchema);
