/**
 * MongoDB Connection Test Script
 * Run: node test-db.js
 * 
 * Ye script check karegi ki MongoDB connection kaam kar rahi hai ya nahi.
 */
require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 MongoDB Configuration:');
console.log('   URI:', process.env.MONGO_URI || '❌ NOT SET');
console.log('');

async function testDB() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env file!');
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('✅ MongoDB Connected!');
    console.log('   Host:', conn.connection.host);
    console.log('   DB  :', conn.connection.name);
    console.log('');

    // Test write
    const TestModel = mongoose.model('_test', new mongoose.Schema({ t: String }));
    const doc = await TestModel.create({ t: new Date().toISOString() });
    console.log('✅ Write test passed! Inserted ID:', doc._id);

    await TestModel.deleteOne({ _id: doc._id });
    console.log('✅ Delete test passed!');

    console.log('\n🎉 MongoDB is fully working!\n');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB Connection FAILED!');
    console.error('   Error:', err.message);
    console.error('\n📋 Fix Steps:');

    if (err.message.includes('ECONNREFUSED') || err.message.includes('connect ETIMEDOUT')) {
      console.error('   → Local MongoDB band hai ya install nahi hai');
      console.error('   → Option 1: MongoDB service start karo:');
      console.error('     net start MongoDB');
      console.error('   → Option 2: MongoDB Atlas (Free Cloud) use karo:');
      console.error('     1. https://cloud.mongodb.com par free account banao');
      console.error('     2. M0 Free Cluster banao');
      console.error('     3. Connection string .env MONGO_URI mein daalo');
    }

    process.exit(1);
  }
}

testDB();
