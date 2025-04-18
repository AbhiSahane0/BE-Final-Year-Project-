require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const nodemailer = require("nodemailer");
const {
  startPolling,
  pollMessageQueue,
  POLLING_INTERVAL,
} = require("./Polling"); // Import polling logic and constants
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // List of allowed MIME types
  const allowedTypes = [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    // Audio
    "audio/mpeg",
    "audio/wav",
    // Video
    "video/mp4",
    "video/x-matroska",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file size limit
  },
  fileFilter: fileFilter,
});

// Connect to MongoDB Atlas
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Connect to Redis with improved error handling
let redis;
try {
  redis = new Redis(REDIS_URL, {
    tls: {}, // Upstash requires TLS for secure connection
    maxRetriesPerRequest: null, // Prevents max retries error
    retryStrategy: (times) => Math.min(times * 100, 3000), // Exponential backoff
    connectTimeout: 10000, // Increase timeout to 10s
  });

  redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
  });

  redis.on("connect", () => {
    console.log("✅ Connected to Redis");
  });
} catch (err) {
  console.error("❌ Failed to initialize Redis:", err);
}

// Import User Model
const User = require("./models/Users");
const MessageQueue = require("./models/MessageQueue");
const OnlineUsers = require("./models/OnlineUsers");

// Validate email function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// UPDATED: Set up SMTP transporter with direct SendGrid configuration
const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", // This should be exactly "apikey" for SendGrid
    pass: process.env.SMTP_PASS, // Your SendGrid API Key
  },
});

// Verify transporter connection
transporter
  .verify()
  .then(() => console.log("✅ SMTP connection verified"))
  .catch((err) => {
    console.error("❌ SMTP connection error:", err);
    console.error("SMTP Details:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? "API key provided" : "No API key",
    });
  });

// Step 1: Generate & Send OTP with improved error handling and logging
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`⚡ Request to send OTP to: ${email}`);

    // Improved validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔢 Generated OTP: ${otp} for ${email}`);

    // Store OTP in Redis (expires in 5 minutes)
    try {
      await redis.setex(email, 300, otp);
      console.log(`✅ OTP stored in Redis for ${email}`);
    } catch (redisError) {
      console.error("❌ Redis error storing OTP:", redisError);
      return res
        .status(500)
        .json({ error: "Failed to generate OTP, please try again" });
    }

    // UPDATED: Send OTP email with better debugging
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Must be a verified sender in SendGrid
      to: email,
      subject: "Your OTP Code for P2P File Sharing App",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a4a4a;">Verification Code</h2>
          <p style="font-size: 16px; color: #666;">Your verification code for P2P File Sharing App is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #888;">This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    console.log("📧 Attempting to send email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `✅ OTP email sent to ${email}. Message ID: ${info.messageId}`
      );
      res.json({ message: "OTP sent successfully" });
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      console.error(
        "Error details:",
        emailError.response || "No detailed response available"
      );

      // Clean up Redis if email fails
      await redis.del(email);

      return res.status(500).json({
        error:
          "Failed to send OTP email. Please check your email address or try again later.",
        details:
          process.env.NODE_ENV === "development"
            ? emailError.message
            : undefined,
      });
    }
  } catch (error) {
    console.error("❌ Error in send-otp endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Rest of your code remains the same...

// Step 2: Verify OTP with improved error handling
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`⚡ Request to verify OTP: ${otp} for ${email}`);

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Retrieve OTP from Redis with improved error handling
    let storedOtp;
    try {
      storedOtp = await redis.get(email);
      console.log(`🔍 Retrieved stored OTP for ${email}: ${storedOtp}`);
    } catch (redisError) {
      console.error("❌ Redis error retrieving OTP:", redisError);
      return res
        .status(500)
        .json({ error: "Failed to verify OTP, please try again" });
    }

    if (!storedOtp) {
      return res.status(400).json({ error: "OTP expired or invalid" });
    }

    if (storedOtp !== otp) {
      console.log(`❌ OTP mismatch: provided ${otp}, stored ${storedOtp}`);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP verified, delete from Redis
    try {
      await redis.del(email);
      console.log(`✅ OTP verified and deleted for ${email}`);
    } catch (redisError) {
      console.error("❌ Redis error deleting OTP:", redisError);
      // Non-critical error, continue with verification
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error in verify-otp endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API Endpoint: Register User
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("📝 Registration request received:", { username, email });

    // Validation
    if (!username || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (!isValidEmail(email)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    try {
      // Check existing users
      console.log("🔍 Checking for existing users...");
      const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ email }),
        User.findOne({ username }),
      ]);

      if (existingEmail) {
        console.log("❌ Email already registered");
        return res.status(400).json({
          success: false,
          error: "Email is already registered. Try Login",
        });
      }

      if (existingUsername) {
        console.log("❌ Username already taken");
        return res.status(400).json({
          success: false,
          error: "Username is taken. Please use a different one",
        });
      }

      // Generate peer ID
      const peerId = `peer-${Math.random().toString(36).substring(2, 15)}`;
      console.log("✅ Generated Peer ID:", peerId);

      // Create and save user
      const newUser = new User({
        username,
        email,
        password,
        peerId,
      });

      console.log("💾 Saving to database...");
      const savedUser = await newUser.save();

      console.log("✅ User saved successfully:", {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        peerId: savedUser.peerId,
      });

      // Send success response
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        username: savedUser.username,
        email: savedUser.email,
        peerId: savedUser.peerId,
      });
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError);
      throw dbError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("❌ Registration error:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
      details: error.message,
    });
  }
});

// API Endpoint: User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ error: "Invalid credentials no user found" });
    }

    // Mark user as online immediately
    await OnlineUsers.markOnline({
      peerId: user.peerId,
      username: user.username,
      email: user.email,
    });
    console.log(`🟢 User ${user.username} marked as online after login`);

    res.json({
      success: true,
      message: "Login successful",
      username: user.username,
      email: user.email,
      peerId: user.peerId,
    });
  } catch (error) {
    console.error("❌ Error logging in:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add this endpoint to your server.js
app.post("/verify-user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      peerId: user.peerId,
      username: user.username,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add this endpoint to check user status
app.post("/check-user-status", async (req, res) => {
  try {
    const { peerId } = req.body;

    // First check if user exists in database
    const user = await User.findOne({ peerId });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Return user data
    res.json({
      found: true,
      username: user.username,
      email: user.email,
      peerId: user.peerId,
    });
  } catch (error) {
    console.error("Error checking user status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add this endpoint to verify peer ID consistency
app.post("/verify-peer-id", async (req, res) => {
  try {
    const { email, peerId } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = user.peerId === peerId;
    res.json({
      match: isMatch,
      storedPeerId: user.peerId,
      providedPeerId: peerId,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check endpoint for testing
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redis && redis.status === "ready" ? "connected" : "disconnected",
    smtp: transporter ? "configured" : "not configured",
    email_from: process.env.EMAIL_FROM || "Not configured",
    sendgrid_key_provided: process.env.SMTP_PASS ? "Yes" : "No",
  });
});

// API Endpoint: Get User Status
app.get("/api/user/status/:peerId", async (req, res) => {
  try {
    const { peerId } = req.params;
    console.log(`📊 Checking status for peer: ${peerId}`);

    // First check if user exists in database
    const user = await User.findOne({ peerId });
    if (!user) {
      console.log(`❌ User not found with peerId: ${peerId}`);
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`✅ User found: ${user.username}`);

    // Check online status from OnlineUsers collection
    const onlineUser = await OnlineUsers.findOne({ peerId });
    console.log(
      `🔍 OnlineUser record:`,
      onlineUser
        ? {
            status: onlineUser.status,
            lastSeen: onlineUser.lastSeen,
          }
        : "No record found"
    );

    // Calculate how recently the user was last seen
    const timeThreshold = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
    const isOnline =
      onlineUser?.status === "online" && onlineUser.lastSeen > timeThreshold;

    console.log(`⏱️ Time threshold: ${timeThreshold.toISOString()}`);
    console.log(`🟢 Is user online? ${isOnline}`);

    return res.json({
      online: isOnline,
      lastSeen: onlineUser?.lastSeen || null,
      username: user.username,
    });
  } catch (error) {
    console.error("Error getting user status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Socket.IO setup
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Keep this for real-time notifications
// But we won't use it for offline message delivery anymore
io.on("connection", async (socket) => {
  console.log("🔌 New socket connection");
  let currentUser = null;

  socket.on("user-online", async (userData) => {
    try {
      currentUser = userData;

      // Update online status using our model method
      await OnlineUsers.markOnline({
        peerId: userData.peerId,
        username: userData.username,
        email: userData.email,
      });

      console.log(`✅ User ${userData.username} is now online`);
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  });

  socket.on("heartbeat", async ({ peerId }) => {
    try {
      if (currentUser && currentUser.peerId === peerId) {
        // Update last seen timestamp
        await OnlineUsers.findOneAndUpdate(
          { peerId },
          { lastSeen: new Date() }
        );
      }
    } catch (error) {
      console.error("Error updating heartbeat:", error);
    }
  });

  socket.on("user-offline", async ({ peerId }) => {
    try {
      if (currentUser && currentUser.peerId === peerId) {
        await OnlineUsers.markOffline(peerId);
        console.log(`User ${peerId} marked as offline`);
      }
    } catch (error) {
      console.error("Error updating offline status:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (currentUser) {
        await OnlineUsers.markOffline(currentUser.peerId);
        console.log(`User ${currentUser.username} disconnected`);
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

// Start the message queue polling mechanism
let pollingInterval;

// Start server and polling
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start polling mechanism without Socket.io dependency
  pollingInterval = startPolling();
  console.log(
    `✅ Message queue polling started (every ${
      POLLING_INTERVAL / 1000
    } seconds)`
  );

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Created uploads directory");
  }
});

// API endpoint to upload file to IPFS and queue for offline delivery
app.post("/api/share/offline", upload.single("file"), async (req, res) => {
  try {
    console.log("📤 Offline sharing request received");

    if (!req.file) {
      console.log("❌ No file received in request");
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(
      `📄 Received file: ${req.file.originalname} (${req.file.size} bytes)`
    );

    const { senderPeerId, senderUsername, receiverPeerId } = req.body;
    console.log(`📎 Request details:`, {
      senderPeerId,
      senderUsername,
      receiverPeerId,
    });

    if (!senderPeerId || !senderUsername || !receiverPeerId) {
      console.log("❌ Missing required fields:", {
        senderPeerId,
        senderUsername,
        receiverPeerId,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if receiver exists
    const receiver = await User.findOne({ peerId: receiverPeerId });
    if (!receiver) {
      console.log(`❌ Receiver not found with peerId: ${receiverPeerId}`);
      return res.status(404).json({ error: "Receiver not found" });
    }
    console.log(`✅ Receiver found: ${receiver.username}`);

    // Check if receiver is currently online
    const isReceiverOnline = await OnlineUsers.findOne({
      peerId: receiverPeerId,
      status: "online",
    });

    // If receiver is online, we'll still queue the message but with a note
    if (isReceiverOnline) {
      console.log(
        `⚠️ Note: Receiver ${receiverPeerId} is currently online, but using offline sharing`
      );
    }

    console.log(
      `📤 Uploading file to IPFS: ${req.file.originalname} (${req.file.size} bytes)`
    );

    // Upload to IPFS using Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Add metadata to help organize files
    const metadata = JSON.stringify({
      name: req.file.originalname,
      sender: senderUsername,
      receiver: receiverPeerId,
      timestamp: new Date().toISOString(),
    });
    pinataFormData.append("pinataMetadata", metadata);

    try {
      console.log("🔄 Sending request to Pinata...");

      // Verify API key exists
      if (!process.env.PINATA_API_KEY) {
        console.error("❌ Pinata API key not found in environment variables");
        throw new Error("IPFS service configuration error");
      }

      console.log(
        "🔑 Using Pinata API key:",
        process.env.PINATA_API_KEY.substring(0, 5) + "..."
      );

      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        pinataFormData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": `multipart/form-data; boundary=${pinataFormData._boundary}`,
            Authorization: `Bearer ${process.env.PINATA_API_KEY}`,
          },
        }
      );

      if (!pinataResponse.data || !pinataResponse.data.IpfsHash) {
        console.error(
          "❌ Failed to get IPFS hash from Pinata response:",
          pinataResponse.data
        );
        throw new Error("Failed to upload to IPFS");
      }

      console.log("✅ File uploaded to IPFS successfully");
      console.log("📝 IPFS Hash:", pinataResponse.data.IpfsHash);

      // Create message queue entry
      const message = new MessageQueue({
        senderPeerId,
        senderUsername,
        receiverPeerId,
        ipfsHash: pinataResponse.data.IpfsHash,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      await message.save();
      console.log(`✅ Message queued for delivery to ${receiverPeerId}`);

      // Clean up temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      res.status(200).json({
        success: true,
        message: "File queued for delivery",
        ipfsHash: pinataResponse.data.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`,
      });
    } catch (pinataError) {
      console.error("❌ Error uploading to IPFS:", pinataError.message);
      console.error(
        "Error details:",
        pinataError.response?.data || "No response data"
      );

      // Clean up temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      throw new Error(`IPFS upload failed: ${pinataError.message}`);
    }
  } catch (error) {
    console.error("❌ Error queueing file for delivery:", error);

    // If there's a file but an error occurred, clean it up
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API endpoint to get pending messages for a user
app.get("/api/messages/pending/:peerId", async (req, res) => {
  try {
    const { peerId } = req.params;

    // Get pending messages marked as ready for this user
    const messages = await MessageQueue.find({
      receiverPeerId: peerId,
      status: "ready",
    }).sort({ readyAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages: messages,
    });
  } catch (error) {
    console.error("❌ Error fetching pending messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint to mark a message as delivered
app.post("/api/messages/delivered/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { peerId } = req.body;

    // Find the message
    const message = await MessageQueue.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Verify the receiver is the one marking as delivered
    if (message.receiverPeerId !== peerId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // Update the message status
    await MessageQueue.findByIdAndUpdate(messageId, {
      status: "delivered",
      deliveredAt: new Date(),
    });

    res.json({
      success: true,
      message: "Message marked as delivered",
    });
  } catch (error) {
    console.error("❌ Error marking message as delivered:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Heartbeat endpoint to keep user marked as online
app.post("/api/user/heartbeat", async (req, res) => {
  try {
    const { peerId, username, email } = req.body;

    if (!peerId) {
      return res.status(400).json({ error: "Peer ID is required" });
    }

    // Update user's online status and last seen time
    await OnlineUsers.markOnline({ peerId, username, email });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Debugging endpoint to check all online users
app.get("/api/debug/users", async (req, res) => {
  try {
    const onlineUsers = await OnlineUsers.find().lean();
    const users = await User.find().select("username peerId email").lean();

    const result = users.map((user) => {
      const onlineStatus = onlineUsers.find((ou) => ou.peerId === user.peerId);
      return {
        ...user,
        status: onlineStatus?.status || "unknown",
        lastSeen: onlineStatus?.lastSeen || null,
      };
    });

    res.json({
      totalUsers: users.length,
      onlineCount: onlineUsers.filter((u) => u.status === "online").length,
      users: result,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API Endpoint: Update User Online Status
app.post("/api/user/update-status", async (req, res) => {
  try {
    const { peerId, username, email } = req.body;
    console.log(`📊 Received update-status request:`, {
      peerId,
      username,
      email,
      body: req.body,
      headers: req.headers,
    });

    if (!peerId || !username || !email) {
      console.log("❌ Missing required fields:", { peerId, username, email });
      return res.status(400).json({
        error: "Missing required fields",
        received: { peerId, username, email },
      });
    }

    // Update or create online status
    const onlineUser = await OnlineUsers.findOneAndUpdate(
      { peerId },
      {
        peerId,
        username,
        email,
        status: "online",
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Updated online status for user:`, {
      username,
      peerId,
      status: onlineUser.status,
      lastSeen: onlineUser.lastSeen,
    });

    res.json({ success: true, onlineUser });
  } catch (error) {
    console.error("❌ Error updating online status:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({
      error: "Failed to update online status",
      details: error.message,
    });
  }
});

// API Endpoint: Mark User as Offline
app.post("/api/user/mark-offline", async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    let peerId;

    if (req.is("application/json")) {
      // Handle JSON request
      peerId = req.body.peerId;
    } else if (req.is("multipart/form-data")) {
      // Handle FormData from sendBeacon
      peerId = req.body.peerId;
    } else {
      // Try to get peerId from body regardless of content type
      peerId = req.body.peerId;
    }

    console.log(`📊 Marking user as offline: ${peerId}`);

    if (!peerId) {
      return res.status(400).json({ error: "Peer ID is required" });
    }

    // Mark user as offline - use a more direct approach for synchronous requests
    const result = await OnlineUsers.findOneAndUpdate(
      { peerId },
      {
        status: "offline",
        lastSeen: new Date(),
      },
      { new: true }
    );

    if (!result) {
      console.log(`❌ User not found with peerId: ${peerId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User marked as offline: ${peerId}`);
    res.json({ success: true, message: "User marked as offline" });
  } catch (error) {
    console.error("Error marking user as offline:", error);
    res.status(500).json({ error: "Failed to mark user as offline" });
  }
});
