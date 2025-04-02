const mongoose = require("mongoose");

const messageQueueSchema = new mongoose.Schema(
  {
    senderPeerId: {
      type: String,
      required: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    receiverPeerId: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "delivered", "failed"],
      default: "pending",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    readyAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      enum: [
        "Maximum delivery attempts reached",
        "Message queue age exceeded",
        null,
      ],
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
messageQueueSchema.index({ receiverPeerId: 1, status: 1 });
messageQueueSchema.index({ timestamp: 1 });

// Export the schema
module.exports = mongoose.model("MessageQueue", messageQueueSchema);
