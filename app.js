require('dotenv').config();
require('colors');
const cors = require('cors');
const express = require('express');
const app = express();

// _______________________PORT_______________________
const PORT = process.env.PORT || 8000;
if (!PORT) {
    console.error("PORT is not defined.".red.bold);
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
})

app.get('/api/chats', (req, res) => {
    res.send('Ye lo chats!!!');
})


// _______________________LISTEN_______________________
const server = app.listen(PORT, () => {
    console.log(`Server started successfully on http://localhost:${PORT}`.green.bold);
})