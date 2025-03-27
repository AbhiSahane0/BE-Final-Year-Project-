const mongoose = require("mongoose");
const MessageQueue = require("./models/MessageQueue");
const OnlineUsers = require("./models/OnlineUsers");
const axios = require("axios");

// Polling interval (30 seconds)
const POLLING_INTERVAL = 30 * 1000;

// Maximum number of delivery attempts
const MAX_DELIVERY_ATTEMPTS = 5;

// Function to check IPFS file availability
async function checkIPFSFile(ipfsHash) {
  try {
    const response = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      {
        timeout: 5000, // 5 second timeout
        validateStatus: (status) => status === 200,
      }
    );
    return true;
  } catch (error) {
    console.error(
      `❌ IPFS file check failed for hash ${ipfsHash}:`,
      error.message
    );
    return false;
  }
}

// Main polling function - no socketIO dependency
const pollMessageQueue = async () => {
  console.log("🔍 Polling the message queue...");

  try {
    // 1️⃣ Fetch pending messages from the queue
    const messages = await MessageQueue.find({
      status: "pending",
      attempts: { $lt: MAX_DELIVERY_ATTEMPTS },
    }).sort({ timestamp: 1 });

    console.log(`📦 Found ${messages.length} pending messages`);

    for (const message of messages) {
      const { receiverPeerId, ipfsHash, _id } = message;

      // 2️⃣ Check if the receiver is online
      const onlineUser = await OnlineUsers.findOne({
        peerId: receiverPeerId,
        status: "online",
      });

      if (onlineUser) {
        console.log(
          `✅ Receiver ${receiverPeerId} is online. Processing message...`
        );

        // 3️⃣ Verify IPFS file is still available
        const isFileAvailable = await checkIPFSFile(ipfsHash);

        if (!isFileAvailable) {
          console.log(
            `❌ IPFS file ${ipfsHash} not available. Marking as failed.`
          );
          await MessageQueue.findByIdAndUpdate(_id, {
            status: "failed",
            $inc: { attempts: 1 },
          });
          continue;
        }

        // 4️⃣ Mark as ready for delivery
        // The receiver will fetch this message when they poll for updates
        await MessageQueue.findByIdAndUpdate(_id, {
          status: "ready",
          readyAt: new Date(),
          $inc: { attempts: 1 },
        });

        console.log(`✅ Message ${_id} marked as ready for delivery`);
      } else {
        // 5️⃣ Increment attempt count for offline receivers
        await MessageQueue.findByIdAndUpdate(_id, {
          $inc: { attempts: 1 },
        });

        console.log(
          `⏳ Receiver ${receiverPeerId} is offline. Attempt ${
            message.attempts + 1
          }/${MAX_DELIVERY_ATTEMPTS}`
        );
      }
    }

    // 6️⃣ Clean up failed messages
    const failedMessages = await MessageQueue.find({
      status: "pending",
      attempts: { $gte: MAX_DELIVERY_ATTEMPTS },
    });

    for (const message of failedMessages) {
      await MessageQueue.findByIdAndUpdate(message._id, {
        status: "failed",
      });
      console.log(
        `❌ Message ${message._id} marked as failed after ${MAX_DELIVERY_ATTEMPTS} attempts`
      );
    }

    // 7️⃣ Clean up old delivered messages (optional)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await MessageQueue.deleteMany({
      status: "delivered",
      deliveredAt: { $lt: thirtyDaysAgo },
    });
  } catch (error) {
    console.error("⚠️ Error polling message queue:", error);
  }
};

// Start the polling process
const startPolling = () => {
  console.log(
    `🚀 Starting message queue polling (every ${
      POLLING_INTERVAL / 1000
    } seconds)`
  );

  // Run once immediately
  pollMessageQueue();

  // Then set interval
  return setInterval(pollMessageQueue, POLLING_INTERVAL);
};

// Export the polling function and constants
module.exports = {
  startPolling,
  pollMessageQueue,
  POLLING_INTERVAL,
  MAX_DELIVERY_ATTEMPTS,
};
