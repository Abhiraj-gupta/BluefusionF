const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Biodiversity = require('../models/Biodiversity');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluefusion';
const DATA_PATH = path.resolve(__dirname, '../Book1_final.json');

async function importData() {
  await mongoose.connect(MONGODB_URI);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  await Biodiversity.deleteMany({}); // Optional: clear old data
  await Biodiversity.insertMany(data);
  console.log('Biodiversity data imported!');
  await mongoose.disconnect();
}

importData().catch(err => {
  console.error(err);
  process.exit(1);
});
