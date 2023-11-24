import express from "express";
import {auth} from "../middleware/auth_middleware.js";
import { task_model } from '../models/task.js';
const router = new express.Router();

//Listing all the tasks
router.get('/tasks',auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if(req.query.completed){
            match.completed = req.query.completed === 'true';
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        await req.user.populate({
            path: 'tasks',
            match: {...match},
            options: {
                limit : parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort : {
                    ...sort
                }
            }
        });
        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send(err);
    }
})

//finding a task..
router.get('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id;

    try {
        const task = await task_model.findOne({_id: id, owner: req.user._id})
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }

})

//creating a task...
router.post('/tasks',auth, async (req, res) => {
    const task  = task_model({
        ...req.body,
        owner: req.user._id
    })
    
    console.log(`Url tasks is hit with request....`);
    try {
        const savedTask = await task.save();
        res.send(savedTask);
    } catch (err) {
        res.send(500).send(err);
    }

})

//Updating a task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'desc', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        res.status(400).send('Invalid Operation...');
    }

    console.log('Tasks url is hit with request..');

    try {
        const task = await task_model.findOne({_id: req.params.id, owner: req.user._id});
        
        // const task = await task_model.findByIdAndUpdate(req.params.id, req.body);
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update)=>{
            task[update] = req.body[update]
        });
        console.log(task);
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
})

//deleting a task
router.delete('/tasks/:id',auth, async (req, res) => {
    try {
        const delete_task = await task_model.findOne({_id: req.params.id, 
            owner: req.user._id});
        await delete_task.deleteOne();
        if (!delete_task) {
            res.status(404).send()
        }
        res.send(delete_task);
    } catch (err) {
        res.status(400).send(err);
    }   
})

export {router};


