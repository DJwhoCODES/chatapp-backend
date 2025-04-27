const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendMessage, allMessages } = require('../controllers/messageController');
const router = express.Router();

router.post('/send', authMiddleware, sendMessage);
router.get('/all-messages/:chatId', authMiddleware, allMessages);

module.exports = router;