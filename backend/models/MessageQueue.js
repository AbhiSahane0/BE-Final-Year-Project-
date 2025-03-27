const mongoose = require("mongoose");

const messageQueueSchema = new mongoose.Schema({
  senderPeerId: { type: String, required: true }, // Sender's Peer ID
  senderUsername: { type: String, required: true }, // Sender's username for notifications
  receiverPeerId: { type: String, required: true }, // Receiver's Peer ID
  ipfsHash: { type: String, required: true }, // IPFS file hash
  fileName: { type: String, required: true }, // Original file name
  fileSize: { type: Number, required: true }, // File size in bytes
  status: {
    type: String,
    enum: ["pending", "ready", "delivered", "failed"],
    default: "pending",
  },
  attempts: { type: Number, default: 0 }, // Number of delivery attempts
  timestamp: { type: Date, default: Date.now }, // Auto-generated timestamp
  readyAt: { type: Date }, // When the message was ready for delivery
  deliveredAt: { type: Date }, // When the file was successfully delivered
});

// Index for faster queries
messageQueueSchema.index({ receiverPeerId: 1, status: 1 });
messageQueueSchema.index({ timestamp: 1 });

// Export the schema
module.exports = mongoose.model("MessageQueue", messageQueueSchema);
