const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { accessChat, fetchChats, createGroup, renameGroup, addMemberToGroup, removeMemberFromGroup } = require('../controllers/chatControllers');

router.post('/access-chat', authMiddleware, accessChat);
router.get('/fetch-chats', authMiddleware, fetchChats);
router.post('/create-group', authMiddleware, createGroup);
router.put('/rename-group', authMiddleware, renameGroup);
router.put('/add-member', authMiddleware, addMemberToGroup);
router.put('/remove-member', authMiddleware, removeMemberFromGroup);

module.exports = router;