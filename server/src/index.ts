import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
const app = express();
const PORT = 5000;
import { Metadata } from './models/metadata';

app.use(cors());
app.use(express.json());

app.post('/submit-metadata', async (req, res) => {
  try {
    const newMetadata = new Metadata(req.body);
    console.log(`Received metadata!: ${req.body}` )
    await newMetadata.save();
    return res.status(201).json({ message: 'Metadata saved to database!' });
  } catch (err) {
    console.error('Error saving metadata:', err);
    return res.status(500).json({ error: 'Failed to save metadata' });
  }
});

mongoose
  .connect('mongodb://localhost:27017/searchpilot')
  .then(() => {
    console.log(' Connected to MongoDB');


    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(' Failed to connect to MongoDB:', error);
    process.exit(1); // Exit if DB connection fails
  });

