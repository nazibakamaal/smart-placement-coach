require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Database connection failed: MONGO_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;