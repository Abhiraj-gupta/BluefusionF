import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import biodiversityRouter from './routes/biodiversity';
import otolithRouter from './routes/otolith';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluefusion');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'BlueFusion Backend API is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register biodiversity API route
app.use('/api/biodiversity', biodiversityRouter);

// Register otolith analysis API routes
app.use('/api/otolith', otolithRouter);

// Ocean1 data endpoint
app.get('/api/ocean1', (req, res) => {
  try {
    const ocean1Data = require('../ocean1.json');
    console.log(`Serving ocean1 data: ${ocean1Data.length} records`);
    res.json(ocean1Data);
  } catch (error) {
    console.error('Error loading ocean1.json:', error);
    res.status(500).json({ error: 'Failed to load oceanographic data' });
  }
});

// Fisheries data endpoint
app.get('/api/fisheries', (req, res) => {
  try {
    const fisheriesData = require('../Fisheries.json');
    console.log(`Serving fisheries data: ${fisheriesData.length} records`);
    res.json(fisheriesData);
  } catch (error) {
    console.error('Error loading Fisheries.json:', error);
    res.status(500).json({ error: 'Failed to load fisheries data' });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;