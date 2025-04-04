import React from "react";
import axios from "axios";
import { notification, Button } from "antd";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

class OfflineMessageManager {
  constructor() {
    this.checkInterval = null;
    this.isChecking = false;
    this.userData = null;
  }

  /**
   * Initialize the offline message manager
   * @param {Object} userData User data with peerId, username, and email
   */
  init(userData) {
    this.userData = userData;
    this.startMessageChecking();
  }

  /**
   * Start checking for pending messages
   */
  startMessageChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check for new messages every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkForPendingMessages();
    }, 30 * 1000);

    // Also check immediately
    this.checkForPendingMessages();
  }

  /**
   * Check for pending messages
   */
  async checkForPendingMessages() {
    if (!this.userData || this.isChecking) return;

    try {
      this.isChecking = true;

      const response = await axios.get(
        `${BACKEND_URL}/api/messages/pending/${this.userData.peerId}`,
        {
          params: {
            username: this.userData.username,
            email: this.userData.email,
          },
        }
      );

      if (response.data.count > 0) {
        this.handlePendingMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error checking pending messages:", error);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Handle pending messages
   * @param {Array} messages Array of message objects
   */
  handlePendingMessages(messages) {
    if (!messages || !messages.length) return;

    // Process each message
    messages.forEach((message) => {
      // Show notification for each message
      notification.info({
        message: "File Available from Offline Sharing",
        description: `${message.senderUsername} shared a file: ${
          message.fileName
        } (${(message.fileSize / 1024).toFixed(2)} KB)`,
        duration: 0, // Don't auto close
        btn: (
          <div>
            <Button
              type="primary"
              size="small"
              onClick={() => this.downloadFile(message)}
              style={{ marginRight: 8 }}
            >
              Download
            </Button>
            <Button
              size="small"
              onClick={() => this.dismissMessage(message._id)}
            >
              Dismiss
            </Button>
          </div>
        ),
      });
    });
  }

  /**
   * Download a file from IPFS
   * @param {Object} message Message object
   */
  async downloadFile(message) {
    try {
      // Open IPFS gateway URL in a new tab
      window.open(
        `https://gateway.pinata.cloud/ipfs/${message.ipfsHash}`,
        "_blank"
      );

      // Mark as delivered
      await axios.post(`${BACKEND_URL}/api/messages/delivered/${message._id}`, {
        peerId: this.userData.peerId,
      });

      notification.success({
        message: "File download initiated",
        description: "The file should begin downloading in a new tab.",
        duration: 3,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      notification.error({
        message: "Download Error",
        description: "Failed to download the file. Please try again.",
        duration: 4,
      });
    }
  }

  /**
   * Dismiss a message without downloading
   * @param {string} messageId Message ID to dismiss
   */
  async dismissMessage(messageId) {
    try {
      // Mark as delivered but without downloading
      await axios.post(`${BACKEND_URL}/api/messages/delivered/${messageId}`, {
        peerId: this.userData.peerId,
      });

      // Close the notification (this will be handled by Ant Design)
    } catch (error) {
      console.error("Error dismissing message:", error);
    }
  }

  /**
   * Stop checking for messages and clean up
   */
  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.userData = null;
    this.isChecking = false;
  }
}

// Create a singleton instance
const offlineMessageManager = new OfflineMessageManager();
export default offlineMessageManager;
