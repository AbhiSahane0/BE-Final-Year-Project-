import Peer from "peerjs";
import { Button, message, notification } from "antd";

// DataType Enum
export const DataType = {
  FILE: "FILE",
  OTHER: "OTHER",
};

let peer; // Peer instance
let connectionMap = new Map(); // To manage peer connections

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
          resolve(id);
        });

        peer.on("error", (err) => {
          // console.error("Peer error:", err);
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

      // Set a timeout to detect connection attempts that hang
      const connectionTimeout = setTimeout(() => {
        reject(new Error("OFFLINE_PEER"));
      }, 2000); // 2 second timeout

      try {
        console.log(`Attempting to connect to peer: ${id}`);
        const conn = peer.connect(id, { reliable: true });

        conn.on("open", () => {
          console.log(`Connection to peer ${id} established successfully`);
          clearTimeout(connectionTimeout);
          connectionMap.set(id, conn);
          resolve();
        });

        conn.on("error", (err) => {
          console.error(`Connection error with peer ${id}:`, err);
          clearTimeout(connectionTimeout);

          // Check if this is an offline peer error
          if (
            err.type === "peer-unavailable" ||
            err.message?.includes("Could not connect to peer") ||
            err.message?.includes("not open")
          ) {
            reject(new Error("OFFLINE_PEER"));
          } else {
            reject(err);
          }
        });

        // Also listen for the connection to close during connection attempt
        conn.on("close", () => {
          console.log(`Connection to peer ${id} closed while connecting`);
          clearTimeout(connectionTimeout);
          reject(new Error("OFFLINE_PEER"));
        });
      } catch (err) {
        console.error(`Exception during connection to peer ${id}:`, err);
        clearTimeout(connectionTimeout);
        reject(err);
      }
    }),

  onIncomingConnection: (callback) => {
    peer?.on("connection", (conn) => {
      connectionMap.set(conn.peer, conn);
      callback(conn);
    });
  },

  onConnectionDisconnected: (id, callback) => {
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("close", () => {
        connectionMap.delete(id);
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
        resolve();
      } catch (err) {
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

  onTransferError: (callback) => {
    if (!peer) return;

    peer.on("error", (error) => {
      console.error("Transfer error:", error);
      callback(error);
    });
  },

  onConnectionError: (id, callback) => {
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("error", (error) => {
        console.error(`Connection error with peer ${id}:`, error);
        callback(error);
      });
    }
  },

  isPeerConnected: (id) => {
    const conn = connectionMap.get(id);
    return conn && conn.open;
  },
};
