const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

dotenv.config();
const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;
const collectionName = process.env.MONGO_DB_COLLECTION;

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.get('/recipes', async (_req, res) => {
  try {
      const client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const recipeInfo = await collection.find({}).toArray();
      
      await client.close();

      res.json(recipeInfo);
  } 
  catch (err) {
      console.error("Error:", err);
      res.status(500).send("Hmmm, something smells... No data for you!");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});