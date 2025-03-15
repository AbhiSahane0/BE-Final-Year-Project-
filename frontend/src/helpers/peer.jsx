import Peer from "peerjs";
import { Button, message, notification } from "antd";

// DataType Enum
export const DataType = {
  FILE: "FILE",
  OTHER: "OTHER",
};

let peer; // Peer instance
let connectionMap = new Map(); // To manage peer connections

// Store received files temporarily
const receivedFiles = new Map();

// Add a Set to track files being processed
const processingFiles = new Set();

// Centralized file handling function
const handleFileDownload = (receivedData) => {
  // Generate a unique file identifier
  const fileId = `${receivedData.fileName}-${Date.now()}`;

  // Check if this file is already being processed
  if (processingFiles.has(fileId)) {
    return;
  }

  try {
    // Mark file as being processed
    processingFiles.add(fileId);

    // Create a Blob from the file data
    const blob = new Blob([receivedData.file], { type: receivedData.fileType });
    const url = URL.createObjectURL(blob);

    // Show notification with download option
    notification.open({
      message: "File Received",
      description: `${receivedData.fileName} (${(
        receivedData.file.byteLength / 1024
      ).toFixed(2)} KB)`,
      btn: (
        <Button
          type="primary"
          onClick={() => {
            const a = document.createElement("a");
            a.href = url;
            a.download = receivedData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            notification.close(fileId);
            message.success(`Downloaded: ${receivedData.fileName}`);
          }}
        >
          Download
        </Button>
      ),
      duration: 60, // Will auto-close after 60 seconds
      key: fileId, // Use unique key for notification
      onClose: () => {
        // Cleanup when notification closes
        processingFiles.delete(fileId);
        URL.revokeObjectURL(url);
      },
    });
  } catch (error) {
    message.error(`Failed to process file: ${error.message}`);
    processingFiles.delete(fileId);
  }
};

// Peer Connection Management
export const PeerConnection = {
  getPeer: () => peer,

  startPeerSession: (peerId = null) =>
    new Promise((resolve, reject) => {
      try {
        peer = new Peer(peerId || undefined);

        peer.on("open", (id) => {
          console.log("Connected with ID:", id);
          message.success("Connected successfully!");
          resolve(id);
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          message.error("Connection error: " + err.message);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    }),

  closePeerSession: () =>
    new Promise((resolve) => {
      if (peer) {
        peer.destroy();
        peer = undefined;
        connectionMap.clear();
      }
      resolve();
    }),

  connectPeer: (id) =>
    new Promise((resolve, reject) => {
      if (!peer) {
        reject(new Error("Not connected"));
        return;
      }
      try {
        const conn = peer.connect(id, { reliable: true });
        conn.on("open", () => {
          connectionMap.set(id, conn);
          message.success("Connected to peer: " + id);
          resolve();
        });

        conn.on("error", (err) => {
          message.error("Connection error: " + err.message);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    }),

  onIncomingConnection: (callback) => {
    peer?.on("connection", (conn) => {
      connectionMap.set(conn.peer, conn);
      message.info("Incoming connection from: " + conn.peer);
      callback(conn);
    });
  },

  onConnectionDisconnected: (id, callback) => {
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("close", () => {
        connectionMap.delete(id);
        message.info("Disconnected from: " + id);
        callback();
      });
    }
  },

  sendConnection: (id, data) =>
    new Promise((resolve, reject) => {
      const conn = connectionMap.get(id);
      if (!conn) {
        reject(new Error("No connection found"));
        return;
      }
      try {
        conn.send(data);
        if (data.dataType === DataType.FILE) {
          message.success(`Sending file: ${data.fileName}`);
        }
        resolve();
      } catch (err) {
        message.error("Failed to send: " + err.message);
        reject(err);
      }
    }),

  onConnectionReceiveData: (id, callback) => {
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("data", (receivedData) => {
        if (receivedData.dataType === DataType.FILE) {
          handleFileDownload(receivedData);
        }
        // Only call callback if it's not a file (to prevent duplicate handling)
        if (receivedData.dataType !== DataType.FILE) {
          callback(receivedData);
        }
      });
    }
  },
};
