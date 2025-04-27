const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: [
            'friend_request','friend_accept','recipe_like','recipe_comment','cookbook_share_request','cookbook_share_accept'
        ], 
        required: true 
    },
    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserInfo' 
    },
    toUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserInfo', 
        required: true 
    },
    data: { 
        type: Object 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
