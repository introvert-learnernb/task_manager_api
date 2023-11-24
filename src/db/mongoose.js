import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async()=>{
    try {
        await mongoose.connect('mongodb+srv://introvertlearnernb:neev%40task_app5256@cluster0.m1jpopq.mongodb.net');
        console.log('MongoDB connected successfully...');
      } catch (error) {
        console.error('Database connection failed:', error);
      }
}


export {connectDB};