import express from "express";
import { user_model } from '../models/user.js';
import { auth } from '../middleware/auth_middleware.js';
import multer from "multer";
import sharp from "sharp";
const router = new express.Router();

//listing all the users..
// router.get('/users', auth, async (req, res) => {
//     console.log('Users url is hit with req..');
//     try {
//         const users = await user_model.find({});
//         res.send(users);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// })

//accessing personal user info
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

//finding a particular user
// router.get('/users/:id', auth, async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await user_model.find({ id: _id });
//         res.send(user);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// })

//Creating a user [signup]
router.post('/users', async (req, res) => {

    const user = user_model(req.body);

    console.log(`users URL is hit with request..`);

    try {
        const token = await user.generateAuthTokens();
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }

})


//Logging In a User
router.post('/users/login', async (req, res) => {
    try {
        const user = await user_model.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthTokens();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
})

//Log Out a User
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
})

//Log Out User from all the devices
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        while (req.user.tokens.length > 0) {
            req.user.tokens.pop();
        }
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
})

//Updating a user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send('Invalid Operation...');
    }

    console.log('Users url is hit with request..');

    try {

        const user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);

        await user.save();

        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
})

//deleting a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = req.user;
        await user.deleteOne();
        res.status(200).send('User removed successufully');
    } catch (err) {
        res.status(400).send(err);
    }
})

//uploading user profile pic
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a jpg,jpeg or png image.'))
        }

        cb(undefined, true);
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send('image uploaded...');
}, (err, req, res, next) => {
    res.status(400).send({ 'err': err.message });
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await user_model.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type','image/png');
        res.send(user.avatar);

    }catch(error){
        res.status(400).send(error);
    }
    
})


router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    req.user.save();
    res.send('avatar is deleted...');
})

export { router };