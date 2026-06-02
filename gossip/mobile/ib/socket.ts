import { MessageSender } from "@/types";
import { QueryClient } from "@tanstack/react-query";
import { Socket, io } from "socket.io-client";
import { create } from "zustand";
import * as Sentry from '@sentry/react-native';
const SOCKET_URL = 'https://pfcr6d99-3000.inc1.devtunnels.ms';
interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: Set<string>;
    typingUsers: Map<string, string>; // chatId -> userId
    unreadChats: Set<string>;
    currentChatId: string | null;
    queryClient: QueryClient | null;

    connect: (token: string, queryClient: QueryClient) => void;
    disconnect: () => void;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    sendMessage: (chatId: string, text: string, currentUser: MessageSender) => void;
    sendTyping: (chatId: string, isTyping: boolean) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
    typingUsers: new Map(),
    unreadChats: new Set(),
    currentChatId: null,
    queryClient: null,
    connect: (token, queryClient) => {
        const existingSocket = get().socket;
        if (existingSocket?.connected) return;
        if(existingSocket) existingSocket.disconnect();

        const socket = io(SOCKET_URL,{auth: { token }})
        socket.on('connect', () => {
            console.log("Socket connectd, id: ",socket.id );
            Sentry.logger.info("Socket connected", {socketId: socket.id})
            set({isConnected: true})
            
        })
        socket.on('disconnect', () => {
            console.log("Socket disconnected");
            Sentry.logger.info("Socket disconnected, id: ", {socketId: socket.id})
            set({isConnected: false})
        })
        socket.on('online-users', ({userId}: {userId: string}) => {
            set((state) => ({
              onlineUsers: new Set([...state.onlineUsers, userId])
            }))
        })
        socket.on('offline-users', ({userId}: {userId: string}) => {
            set((state) => {
             const onlineUsers = new Set(state.onlineUsers);
             onlineUsers.delete(userId);
             return { onlineUsers: onlineUsers };
            })
        })
        socket.on('socket-error',(error: {message: string}) => {
            console.error("Socket error: ",error.message);
            Sentry.logger.error("Socket error", {message: error.message})
            
        })
        set({socket, queryClient})
    },
    disconnect: () => {
        const socket = get().socket;
        if(socket) {
            socket.disconnect();
            set({
                socket: null,
    isConnected: false,
    onlineUsers: new Set(),
    typingUsers: new Map(),
    unreadChats: new Set(),
    currentChatId: null,
    queryClient: null,

            })
        }
    },
    joinChat: () => {},
    leaveChat: () => {},
    sendMessage: () => {},
    sendTyping: () => {},

}))