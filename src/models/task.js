import mongoose from "mongoose";

const task_schema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    desc:{
        type:String,
        trim:true,
        required:true
    },
    completed:{
        type:Boolean,
        trim:true,
        default:false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user_collection'
    }
    
},{
    timestamps:true
});

const task_model = mongoose.model('task_collection',task_schema);

export {task_model};