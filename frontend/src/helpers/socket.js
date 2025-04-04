import io from "socket.io-client";
import { message } from "antd";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userData) {
    if (this.socket) {
      // If already connected with same user, do nothing
      if (this.socket.connected && this.currentUser === userData.peerId) {
        return;
      }
      // If connected with different user or disconnected, cleanup first
      this.disconnect();
    }

    this.currentUser = userData.peerId;
    this.socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to Socket.IO server");
      this.connected = true;
      this.reconnectAttempts = 0;

      // Emit user online status
      this.socket.emit("user-online", {
        peerId: userData.peerId,
        username: userData.username,
        email: userData.email,
      });
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from Socket.IO server");
      this.connected = false;
    });

    this.socket.on("file-received", (data) => {
      // Show notification using Ant Design's notification system
      const { notification } = require("antd");
      notification.success({
        message: "New File Available",
        description: `${data.from} has shared a file: ${data.fileName} (${(
          data.fileSize / 1024
        ).toFixed(2)} KB)`,
        duration: 0,
        onClick: () => {
          window.open(
            `https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`,
            "_blank"
          );
        },
      });
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        message.error("Failed to connect to notification server");
        this.disconnect();
      }
    });

    // Heartbeat to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit("heartbeat", { peerId: userData.peerId });
      }
    }, 30000); // Every 30 seconds
  }

  disconnect() {
    if (this.socket) {
      // Emit offline status before disconnecting
      if (this.connected && this.currentUser) {
        this.socket.emit("user-offline", { peerId: this.currentUser });
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentUser = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const socketManager = new SocketManager();
export default socketManager;
