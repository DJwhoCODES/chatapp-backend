require('dotenv').config();
require('colors');
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL);
        console.log('DB connected successfully!!!'.bgMagenta.bold);
    } catch (error) {
        console.log(`Error: ${error.message}`.bgRed.bold);
        process.exit(1);
    }
}

module.exports = connectDB;