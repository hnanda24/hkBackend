const express = require('express');
const User = require('../models/userDb.js')
const zod = require('zod')
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
const SECRET = process.env.SECRET;
const authMiddleware = require('../middleware/authMiddleware.js')

const signUpSchema = zod.object({
    userName: zod.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    firstName: zod.string()
    .min(3, "Firstname must be at least 3 characters")
    .max(20, "Firstname must be at most 20 characters"),

    lastName: zod.string()
    .min(3, "Lastname must be at least 3 characters")
    .max(20, "Lastname must be at most 20 characters"),

    email: zod.string().email("Invalid email format"),
    
    password: zod.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character")
});

const loginSchema = zod.object({
    email: zod.string().email("Invalid email format"),
    password: zod.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character")
})

router.post('/register', async(req,res) => {
    try{
        const {userName,firstName,lastName, email, password} = req.body;

        const validateUser = signUpSchema.safeParse({userName,firstName,lastName,email,password})

        if(!validateUser.success){
            return res.status(400).json({message: "Validation failed"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User alreasy Exists'})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({userName,email,password: hashedPassword})
        await newUser.save();
    }
    
    catch(err){
        return res.status(500).json({
            message: err
        })
    }
})

router.post('/login', async(req,res) => {
    try{
        const {email, password} = req.body;
        
        const validateUser = loginSchema.safeParse({email,password});

        if(!validateUser.success){
            return res.status(400).json({message: "Validation failed"})
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User does not exist "
            })
        }
        const passCheck = await bcrypt.compare(password, user.password)
        if(!passCheck){
            return res.status(400).json({
                message: "Password mismatch"
            })
        }
        var token = jwt.sign({email: user.email}, SECRET)
        return res.status(200).json({
            token,
            message: "Logged in"
        })
    }

    catch(err){
        return res.status(500).json({
            message: err
        })
    }
})

router.get('/displayAllUser', async(req,res) => {
    try{
        const allUser = await User.find();
        if(allUser){
            return res.status(200).json(allUser);
        }
        else
        {
            return res.status(400).json({
                message: "No user Exist"
            })
        }
    }
    catch(err){
        return res.status(500).json({
            message: err
        })
    }
})

router.get('/displayUser',authMiddleware, async(req,res) => {
    try{
        // console.log(req.decodedToken)
        const loggedInUser = await User.findOne({email: req.decodedToken.email}).select("-password")
        if(!loggedInUser){
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json(loggedInUser);
    }
    catch(err){
        return res.status(500).json({
            message: err
        })
    }
})

module.exports = router;