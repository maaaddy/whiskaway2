const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserInfo'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserInfo'
    },
    text: String,
}, {timestamps:true});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;