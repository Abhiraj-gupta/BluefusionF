const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluefusion';
const DATA_PATH = path.resolve(__dirname, '../Book1_final.json');

// Define the schema directly in this script
const BiodiversitySchema = new mongoose.Schema({
  decimalLatitude: Number,
  decimalLongitude: Number,
  date_year: Number,
  depth: Number,
  family: String,
  familyid: Number,
  genus: String,
  genusid: Number,
  habitat: String,
  dataset_id: String,
  class: String,
  classid: Number
});

const Biodiversity = mongoose.model('Biodiversity', BiodiversitySchema);

async function importData() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully!');
  
  console.log('Reading data file...');
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Found ${data.length} records to import`);
  
  console.log('Clearing existing data...');
  await Biodiversity.deleteMany({});
  
  console.log('Importing new data...');
  await Biodiversity.insertMany(data);
  console.log('Biodiversity data imported successfully!');
  
  const count = await Biodiversity.countDocuments();
  console.log(`Total records in database: ${count}`);
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

importData().catch(err => {
  console.error('Error importing data:', err);
  process.exit(1);
});