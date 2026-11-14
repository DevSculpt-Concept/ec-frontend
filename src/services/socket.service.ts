/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "@/lib/http";
import { getAuthToken } from "@/config/api";

const SOCKET_URL = API_ORIGIN;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(userId?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }
    // The server authenticates the socket with the same JWT as the REST API and derives
    // the user's room from it, so no explicit "join" is needed.
    const token = getAuthToken();
    if (!token) return null;
    if (this.socket) this.socket.disconnect();

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      // Evaluated on every (re)connect so a refreshed token is picked up.
      auth: (cb) => cb({ token: getAuthToken() }),
    });

    this.socket.on("connect", () => {
      if (userId) {
        this.joinUserRoom(userId);
      }
    });

    this.socket.on("disconnect", () => {});

    this.socket.on("connect_error", () => {});

    // Re-emit events to registered listeners
    this.socket.onAny((event, data) => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach((callback) => callback(data));
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join", userId);
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_conversation", conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  sendMessage(data: {
    conversationId: string;
    message: any;
    recipientId?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", data);
    }
  }

  sendTyping(conversationId: string, userId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("typing", { conversationId, userId, isTyping });
    }
  }

  // Subscribe to events
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Also register with socket directly if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  // Remove event listener
  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
