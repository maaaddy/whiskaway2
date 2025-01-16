const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;
const collectionName1 = process.env.MONGO_DB_COLLECTION1;
const collectionName2 = process.env.MONGO_DB_COLLECTION2;

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.get('/recipes', async (_req, res) => {
  try {
      const client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection(collectionName1);
      const recipeInfo = await collection.find({}).toArray();
      
      await client.close();

      res.json(recipeInfo);
  } 
  catch (err) {
      console.error("Error:", err);
      res.status(500).send("No data for you!");
  }
});

app.get('/users', async (_req, res) => {
  try {
      const client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection(collectionName2);
      const userInfo = await collection.find({}).toArray();
      
      await client.close();

      res.json(userInfo);
  } 
  catch (err) {
      console.error("Error:", err);
      res.status(500).send("No data for you!");
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection(collectionName2);

    const user = await collection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    await client.close();
    res.status(200).json({ message: 'Login successful' });
    
  } 
  catch (err) {
    console.error("Error:", err);
    res.status(500).send("No data for you!");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});