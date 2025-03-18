const mongoose = require("mongoose");

const onlineUserSchema = new mongoose.Schema({
  peerId: { type: String, required: true, unique: true }, // Online user's Peer ID
  username: { type: String, required: true }, // User's username
  email: { type: String, required: true }, // User's email
  status: {
    type: String,
    enum: ["online", "away", "offline"],
    default: "online",
  },
  lastSeen: { type: Date, default: Date.now }, // Timestamp of last activity
  socketId: { type: String }, // Socket.io connection ID if applicable
});

// Index for faster queries
onlineUserSchema.index({ peerId: 1 });
onlineUserSchema.index({ status: 1, lastSeen: -1 });

// Method to update last seen
onlineUserSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  return this.save();
};

// Export the schema
module.exports = mongoose.model("OnlineUser", onlineUserSchema);
