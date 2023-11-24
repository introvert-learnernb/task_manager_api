import mongoose from "mongoose";
import 'dotenv/config';
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { task_model } from "./task.js";

const user_schema = new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid.....')
            }
        }
    },
    age:{
        type:Number,
        trim:true,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age cannot be less than 0...')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        minlenght:8,
        validate(value){
            if(value.toLowerCase() == 'password'){
                throw new Error('Password is not valid...')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

// creating relationship between user_collection and task_collection
user_schema.virtual('tasks', {
    ref : 'task_collection',
    localField:'_id',
    foreignField:'owner'
})


user_schema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}


user_schema.methods.generateAuthTokens = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'secret123');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}



user_schema.statics.findByCredentials = async (email, password)=>{
    const user = await user_model.findOne({email});
    
    if(!user){
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('Unable to login');
    }

    return user
}

//Hashing the password...
user_schema.pre('save', async function(next){
    const user = this ; // accessed the object with the values passed from req.body..

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    console.log('Just before saving....');

    next() // to indicate that this middleware has been implemented completely..
})

//Deleting all the tasks when user is deleted
user_schema.pre('deleteOne', async function(next){
    const user = this;
    // console.log(user);
    await task_model.deleteMany({owner: user._conditions._id});
    next();
})

const user_model = mongoose.model('user_collection',user_schema);


export {user_model};