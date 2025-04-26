require('dotenv').config();
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).send({ message: 'Access Denied: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Invalid Token', error });
    }
};

module.exports = authMiddleware;
