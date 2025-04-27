const chatModel = require("../models/chatModel");
const messageModel = require("../models/messageModel");

const sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            res.sendStatus(400);
            throw new Error("All Fields Are Mandatory!");
        }

        var newMsg = {
            sender: req.user._id,
            content,
            chat: chatId
        };

        var createMessage = await messageModel.create(newMsg);

        var addedMessage = await messageModel.findById(createMessage._id)
            .populate("sender", "name pic")
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name pic email"
                }
            });

        await chatModel.findByIdAndUpdate((chatId), { latestMessage: addedMessage }, { new: true });

        res.json(addedMessage);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message
        });
    }
}

const allMessages = async (req, res) => {
    try {
        const messages = await messageModel.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");

        res.status(200).json(messages);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
}

module.exports = { sendMessage, allMessages };