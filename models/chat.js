const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
	{
		text: String,
		author: {
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true, capped: {size:1024, max:1000} }
);

const Chat = new mongoose.model("Chat", chatSchema);

module.exports = Chat;
