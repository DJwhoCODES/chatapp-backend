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
    origin: [process.env.CLIENT_URL],
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


// _______________________IMPLEMENTING_WEBSOCKETS_______________________
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_URL
    }
});

io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat?.users) return console.log("Chat.users is not defined!");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.to(chat._id).emit("message received", newMessageReceived);
        })
    });

    socket.off("setup", () => {
        console.log("User Disconnected!");
        socket.leave(userData._id);
    })
});