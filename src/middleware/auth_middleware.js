import jwt from 'jsonwebtoken';
import { user_model } from '../models/user.js';
import 'dotenv/config';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,'secret123');
        const user = await user_model.findOne({_id: decoded._id,'tokens.token':token});

        if(!user){
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send(`You are not authorized ${err}`);
    }
}

export { auth };


  