import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Url from "../models/url.model.js";
import { SUCCESS, FAIL, ERROR } from '../utils/httpStautsText.js';

const register = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({status : FAIL , msg : "Request body is missing"});
    }
    try {
        const { userName , email , password } = req.body;

        if (!userName || !email || !password){
            return res.status(400).json({status : FAIL , msg : "All fields are required"});
        }

        const existEmail = await User.findOne({email});

        if (existEmail){
            return res.status(401).json({status : FAIL , msg : "This email already exist"});
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const newUser = new User({
            username : userName,
            email,
            password : hashedPassword
        });

        const token = jwt.sign({id : newUser._id , email}, process.env.JWT_SECRET , {expiresIn : '30d'});
        newUser.token = token;

        await newUser.save();

        return res.status(201).json({status : SUCCESS , msg : "User registered successfully"});
    } catch (error) {
        return res.status(500).json({status : ERROR , msg : "Internal server error"});
    }
}


const login = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({status : FAIL , msg : "Request body is missing"});
    }
    try {
        const { email , password } = req.body;

        if (!email || !password){
            return res.status(400).json({status : FAIL , msg : "All fields are required"});
        }

        const user = await User.findOne({email});

        if (!user){
            return res.status(401).json({status : FAIL , msg : "Invalid email or password"});
        }

        const matchPassword = await bcrypt.compare(password , user.password);

        if (!matchPassword){
            return res.status(401).json({status : FAIL , msg : "Invalid email or password"});
        }

        const token = jwt.sign({id : user._id , email}, process.env.JWT_SECRET , {expiresIn : '30d'});
        user.token = token;

        await user.save();

        return res.status(200).json({status : SUCCESS , msg : "Login successful" , token});
    } catch (error) {
        return res.status(500).json({status : ERROR , msg : "Internal server error"});
    }
}


const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ status: FAIL, msg: "Unauthorized" });
        }

        const user = await User.findById(userId).select('-password -__v');
        
        if (!user) {
            return res.status(404).json({ status: FAIL, msg: "User not found" });
        }
        
        const getAllUrls = await Url.find({ $or: [ { sharedWith: { $in: [userId] } }, { userId: userId } ] });
         
  
        return res.status(200).json({ status: SUCCESS, data: { user, urls: getAllUrls } });
        

    } catch (error) {
        return res.status(500).json({ status: ERROR, msg: "Internal server error" });
    }
}

export { register , login , getProfile };