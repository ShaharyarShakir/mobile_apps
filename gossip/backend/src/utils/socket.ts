import { Server as HttpServer } from "node:http";

import { verifyToken } from "@clerk/express";
import { Server as SocketServer, Socket } from "socket.io";

import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { User } from "../models/User";

// interface SocketWithUserId extends Socket {
//   userId?: string;
// }
export const onlineUsers: Map<string, string> = new Map(); // userId -> socketId
export const initializeSocket = (httpServer: HttpServer) => {
	const allowedOrigins = [
		"http://localhost:51743", // react
		"http://localhost:8081", // expo
		process.env.FRONTEND_URL!, // production
	].filter(Boolean) as string[];
	const io = new SocketServer(httpServer, {
		cors: {
			origin: allowedOrigins,
		},
	});
	// verify socket connection - if the user auth , we'll store the user id in socket.data.userId
	io.use(async (socket, next) => {
		const token = socket.handshake.auth.token; // user send from client
		if (!token) return next(new Error("Authentication error"));
		try {
			const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
			const clerkId = session.sub;
			const user = await User.findOne({ clerkId });
			if (!user) return next(new Error("User not found"));
			socket.data.userId = user._id.toString();
			next();
		} catch (error: any) {
			next(new Error(error));
		}
	});
	// this "connection" event will be triggered when a client successfully connects to the socket server
	io.on("connection", (socket) => {
		const userId = socket.data.userId;
		// send list of online users to the newly connected user
		socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });
		onlineUsers.set(userId, socket.id);
		socket.broadcast.emit("user-online", { userId }); // notify other users that this user is online
		socket.join(`user:${userId}`);
		socket.on("join-chat", (chatId: string) => {
			socket.join(`chat:${chatId}`);
		});
		socket.on("leave-chat", (chatId: string) => {
			socket.leave(`chat:${chatId}`);
		});
		socket.on("send-message", async (data: { chatId: string; text: string }) => {
			try {
				const { chatId, text } = data;
				const chat = await Chat.findOne({
					_id: chatId,
					participants: userId,
				});
				if (!chat) {
					socket.emit("socket-error", { message: "Chat not found" });
					return;
				}
				const message = await Message.create({
					chat: chatId,
					sender: userId,
					text,
				});
				chat.lastMessage = message._id;
				chat.lastMessageAt = new Date();
				await chat.save();
				await message.populate("sender", "name email avatar");
				// emit to chat room
				io.to(`chat:${chatId}`).emit("new-message", { message });
				// chat list view
				for (const participantId of chat.participants) {
					io.to(`user:${participantId}`).emit("new-message", message);
				}
			} catch (error) {
				socket.emit("socket-error", { message: "Failed to send message" });
			}
		});
		socket.on("typing", async (data) => {});
		socket.on("disconnect", () => {
			onlineUsers.delete(userId!);
			socket.broadcast.emit("user-offline", { userId });
		});
	});
	return io;
};
