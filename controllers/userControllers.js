require('dotenv').config();
const userModel = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function genToken(id) {
    const jwt_token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    return jwt_token;
}

const register = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("All The Fields Are Required!");
        }

        const userExists = await userModel.findOne({ email });

        if (userExists) {
            res.status(409);
            throw new Error("User Already Exists!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            pic
        });

        if (!user) {
            res.status(500);
            throw new Error("User Cannot Be Created!");
        }

        const token = genToken(user._id);

        // Set cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'strict', // protect against CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            pic: user.pic
        });
    } catch (error) {
        console.log(`Error: ${error.message}`.bgRed.bold);
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("All fields are required!");
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error("Invalid email or password!");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.status(401);
            throw new Error("Invalid email or password!");
        }

        const token = genToken(user._id);

        // Set token in cookie
        res.cookie('jwt', token, {
            httpOnly: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
};

const getUsers = async (req, res) => {
    const keyword = req.query.search;
    const userId = req.user._id;

    const filter = keyword ? { name: { $regex: keyword, $options: "i" }, _id: { $ne: userId } } : { _id: { $ne: userId } };

    const users = await userModel.find(filter);

    res.status(200).send(users);
}

module.exports = { register, login, getUsers };