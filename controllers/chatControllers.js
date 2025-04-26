const chatModel = require('../models/chatModel');
const userModel = require('../models/userModel');

const accessChat = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400);
        }

        var chatExists = await chatModel.findOne({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ]
        }).populate("users", "-password").populate("latestMessage");

        chatExists = await userModel.populate(chatExists, {
            path: "latestMessage.sender",
            select: "name pic email"
        });

        if (chatExists) {
            res.send(chatExists);
        } else {
            var chatData = {
                chatName: "Sender",
                isGroupChat: false,
                users: [req.user._id, userId]
            };

            const createNewChat = await chatModel.create(chatData);

            const fullChat = await chatModel.findById(createNewChat._id).populate("users", "-password");

            res.status(200).send(fullChat);
        }
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const fetchChats = async (req, res) => {
    try {
        const getChats = await chatModel.find({
            users: { $elemMatch: { $eq: req.user._id } }
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "name pic email"
                }
            })
            .sort({ updatedAt: -1 });

        res.send(getChats);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const createGroup = async (req, res) => {
    try {
        const { users, chatName } = req.body;
        if (!users.length || !chatName) {
            res.status(400);
            throw new Error('All the fields are mandatory!');
        }

        var allUsers = JSON.parse(users);

        if (allUsers.length < 1) {
            res.status(400);
            throw new Error('Add atleast 2 users!');
        }

        allUsers.push(req.user);

        const groupData = {
            chatName: chatName,
            users: allUsers,
            isGroupChat: true,
            groupAdmin: req.user
        };

        const createGroup = await chatModel.create(groupData);

        const groupChat = await chatModel.findById(createGroup._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(201).json(groupChat);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;

        const updatedChat = await chatModel.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate("users", "--password")
            .populate("groupAdmin", "-password")

        if (!updatedChat) {
            res.status(404);
            throw new Error("Chat Not Found!");
        }

        res.status(200).send(updatedChat);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const addMemberToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const added = await chatModel.findByIdAndUpdate(chatId,
            {
                $push: { users: userId }
            },
            {
                new: true
            })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            res.status(404);
            throw new Error("Chat Not Found!");
        }

        res.status(200).send(added);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const removeMemberFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const removed = await chatModel.findByIdAndUpdate(chatId,
            {
                $pull: { users: userId }
            },
            {
                new: true
            })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found!");
        }

        res.status(200).send(removed);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

module.exports = { accessChat, fetchChats, createGroup, renameGroup, addMemberToGroup, removeMemberFromGroup };