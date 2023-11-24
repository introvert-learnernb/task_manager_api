import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected successfully...');
      } catch (error) {
        console.error('Database connection failed:', error);
      }
}


export {connectDB};