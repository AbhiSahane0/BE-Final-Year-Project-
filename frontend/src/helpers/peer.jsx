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

// Function to handle file downloads
const handleDownload = (fileName) => {
  const fileData = receivedFiles.get(fileName);
  if (!fileData) {
    message.error("File not found or already downloaded!");
    return;
  }

  // Convert ArrayBuffer to Blob
  const fileBlob = new Blob([fileData.buffer], { type: fileData.fileType });

  // Create a download link
  const fileURL = URL.createObjectURL(fileBlob);
  const a = document.createElement("a");
  a.href = fileURL;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  URL.revokeObjectURL(fileURL);
  receivedFiles.delete(fileName);
};

// Peer Connection Management
export const PeerConnection = {
  getPeer: () => peer,

  startPeerSession: (peerId = null) =>
    new Promise((resolve, reject) => {
      try {
        peer = new Peer(peerId || undefined);

        peer.on("open", (id) => {
          console.log("My ID: " + id);
          resolve(id);
        });

        peer.on("error", (err) => {
          console.error(err);
          message.error(err.message);
          reject(err);
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    }),

  closePeerSession: () =>
    new Promise((resolve, reject) => {
      try {
        if (peer) {
          peer.destroy();
          peer = undefined;
        }
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    }),

  connectPeer: (id) =>
    new Promise((resolve, reject) => {
      if (!peer) {
        reject(new Error("Peer hasn't started yet"));
        return;
      }
      if (connectionMap.has(id)) {
        reject(new Error("Connection already exists"));
        return;
      }
      try {
        const conn = peer.connect(id, { reliable: true });
        if (!conn) {
          reject(new Error("Connection can't be established"));
        } else {
          conn.on("open", () => {
            console.log("Connected to: " + id);
            connectionMap.set(id, conn);
            resolve();
          });

          conn.on("error", (err) => {
            console.error(err);
            reject(err);
          });
        }
      } catch (err) {
        reject(err);
      }
    }),

  onIncomingConnection: (callback) => {
    peer?.on("connection", (conn) => {
      console.log("Incoming connection: " + conn.peer);
      connectionMap.set(conn.peer, conn);
      callback(conn);
    });
  },

  onConnectionDisconnected: (id, callback) => {
    if (!peer) {
      throw new Error("Peer hasn't started yet");
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection doesn't exist");
    }
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("close", () => {
        console.log("Connection closed: " + id);
        connectionMap.delete(id);
        callback();
      });
    }
  },

  sendConnection: (id, data) =>
    new Promise((resolve, reject) => {
      if (!connectionMap.has(id)) {
        reject(new Error("Connection doesn't exist"));
        return;
      }
      try {
        const conn = connectionMap.get(id);
        if (conn) {
          conn.send(data);
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    }),

  onConnectionReceiveData: (id, callback) => {
    console.log("This function handles data receiving");

    if (!peer) {
      throw new Error("Peer hasn't started yet");
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection doesn't exist");
    }

    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("data", (receivedData) => {
        console.log("Receiving data from " + id);

        if (receivedData.dataType === DataType.FILE) {
          console.log("File received:", receivedData.fileName);

          // Store file data
          receivedFiles.set(receivedData.fileName, {
            buffer: receivedData.file,
            fileType: receivedData.fileType,
          });

          // Show notification with a download button
          notification.open({
            message: "File Received",
            description: `You have received a file: ${receivedData.fileName}. Click below to download.`,
            btn: (
              <Button
                type="primary"
                onClick={() => handleDownload(receivedData.fileName)}
              >
                Download
              </Button>
            ),
          });
        }

        callback(receivedData);
      });
    }
  },
};
