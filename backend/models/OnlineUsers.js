const mongoose = require("mongoose");

const onlineUserSchema = new mongoose.Schema({
  peerId: { type: String, required: true, unique: true }, // Online user's Peer ID
  username: { type: String, required: true }, // User's username
  email: { type: String, required: true }, // User's email
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
  lastSeen: { type: Date, default: Date.now }, // Timestamp of last activity
});

// Index for faster queries
onlineUserSchema.index({ peerId: 1 });
onlineUserSchema.index({ status: 1, lastSeen: -1 });

// Method to update last seen
onlineUserSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  return this.save();
};

// Static method to mark user as online
onlineUserSchema.statics.markOnline = async function (userData) {
  return this.findOneAndUpdate(
    { peerId: userData.peerId },
    {
      peerId: userData.peerId,
      username: userData.username,
      email: userData.email,
      status: "online",
      lastSeen: new Date(),
    },
    { upsert: true, new: true }
  );
};

// Static method to mark user as offline
onlineUserSchema.statics.markOffline = async function (peerId) {
  return this.findOneAndUpdate(
    { peerId },
    {
      status: "offline",
      lastSeen: new Date(),
    },
    { new: true }
  );
};

// Export the schema
module.exports = mongoose.model("OnlineUser", onlineUserSchema);
