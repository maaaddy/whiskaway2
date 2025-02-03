require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://maddy-laptop:ReArPdd9zmrtBpEy@cluster0.misua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function updateUsers() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const result = await User.updateMany({}, { 
            $set: { 
                fName: "", 
                lName: "", 
                bio: "", 
                friends: [] 
            }
        });

        console.log(`Updated ${result.modifiedCount} users`);
    } catch (error) {
        console.error("Error updating users:", error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the update function
updateUsers();
