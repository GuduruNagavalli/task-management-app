const mongoose = require('mongoose');

let connected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_app';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connected = true;
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    connected = false;
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
};

const isConnected = () => connected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isConnected };
