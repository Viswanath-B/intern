import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const applicationSchema = new mongoose.Schema({
  paymentScreenshot: String,
  fullName: String,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Application = mongoose.model('Application', applicationSchema);

async function checkEntries() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const entries = await Application.find().sort({ createdAt: -1 }).limit(10);
    
    if (entries.length > 0) {
      console.log('---START_JSON---');
      console.log(JSON.stringify(entries, null, 2));
      console.log('---END_JSON---');
    } else {
      console.log('No entries found in the database.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkEntries();
