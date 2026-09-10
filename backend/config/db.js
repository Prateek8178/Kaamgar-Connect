const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📂 Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      retries--;
      console.error(`❌ MongoDB Error (${5 - retries}/5): ${error.message}`);
      if (retries === 0) {
        console.error('⚠️  MongoDB failed after 5 retries. Server will continue without DB.');
        console.error('💡 Fix: MongoDB Atlas > Network Access > Add 0.0.0.0/0');
        // Don't exit — let Render health check pass, DB will reconnect
        return;
      }
      console.log(`🔄 Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

module.exports = connectDB;
