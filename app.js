import Express from 'express';
import 'dotenv/config';
import { connectDB } from './src/db/mongoose.js';
import { router as UserRouter } from './src/routers/user.js';
import { router as TaskRouter } from './src/routers/task.js';


const app = Express();

//using the express middleware to parse the JSON data into Object..
app.use(Express.json());

//configuring port to use environment variable PORT or 5000
// const port = process.env.PORT || 5000;
const port = `0.0.0.0:$PORT`;

//Connecting to the database.....
connectDB();

//Using the Router Middlware
app.use(UserRouter);
app.use(TaskRouter);


//without Middleware:- request -> run route handler

//with Middleware:- request -> do something -> run route handler


//Root Route

app.get('/', (req, res) => {
    res.send('Hello Buddy...');
})


app.listen(port, () => {
    console.log(`Server is listening at port no. ${port}`);
})

