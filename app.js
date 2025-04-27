require('dotenv').config();
require('colors');
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const app = express();
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// _______________________CONNECT_DB_______________________
connectDB();

// _______________________CONIFGURATIONS_______________________
app.use(express.json());
app.use(cookieParser());

// _______________________PORT_______________________
const PORT = process.env.PORT || 8000;
if (!PORT) {
    console.error("PORT is not defined.".bgRed.bold);
    process.exit(1);
}

// _______________________CORS_______________________
const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// _______________________ROUTES_______________________
app.get('/', (req, res) => {
    res.send("Welcome To ChatApp!");
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);


// _______________________LISTEN_______________________
const server = app.listen(PORT, () => {
    console.log(`Server started successfully on http://localhost:${PORT}`.bgCyan.bold);
});