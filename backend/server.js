require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const nodemailer = require("nodemailer");
const { pollMessageQueue, POLLING_INTERVAL } = require("./Polling"); // Import polling logic and constants
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

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

    // First check if user exists in database
    const user = await User.findOne({ peerId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has an active socket connection
    const isSocketConnected = activeConnections.has(peerId);

    // Check online status from OnlineUsers collection
    const onlineUser = await OnlineUsers.findOne({ peerId });

    // User is considered online if they have an active socket connection
    // and their status is 'online' in the database
    const isOnline = isSocketConnected && onlineUser?.status === "online";

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

// Map to track active socket connections
const activeConnections = new Map();

io.on("connection", async (socket) => {
  console.log("🔌 New socket connection");
  let currentUser = null;

  socket.on("user-online", async (userData) => {
    try {
      currentUser = userData;
      activeConnections.set(userData.peerId, socket.id);

      // Update or create online user record
      const onlineUser = await OnlineUsers.findOneAndUpdate(
        { peerId: userData.peerId },
        {
          peerId: userData.peerId,
          username: userData.username,
          email: userData.email,
          status: "online",
          lastSeen: new Date(),
          socketId: socket.id,
        },
        { upsert: true, new: true }
      );
      console.log(`✅ User ${userData.username} is now online`);
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  });

  socket.on("heartbeat", async ({ peerId }) => {
    try {
      if (activeConnections.get(peerId) === socket.id) {
        await OnlineUsers.findOneAndUpdate(
          { peerId },
          {
            lastSeen: new Date(),
            status: "online",
          }
        );
      }
    } catch (error) {
      console.error("Error updating heartbeat:", error);
    }
  });

  socket.on("user-offline", async ({ peerId }) => {
    try {
      if (activeConnections.get(peerId) === socket.id) {
        await OnlineUsers.findOneAndUpdate(
          { peerId },
          {
            status: "offline",
            lastSeen: new Date(),
          }
        );
        activeConnections.delete(peerId);
        console.log(`User ${peerId} marked as offline`);
      }
    } catch (error) {
      console.error("Error updating offline status:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (currentUser) {
        const { peerId } = currentUser;
        if (activeConnections.get(peerId) === socket.id) {
          await OnlineUsers.findOneAndUpdate(
            { peerId },
            {
              status: "offline",
              lastSeen: new Date(),
            }
          );
          activeConnections.delete(peerId);
          console.log(`User ${currentUser.username} disconnected`);
        }
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

// Start polling mechanism
const poll = pollMessageQueue(io);
setInterval(poll, POLLING_INTERVAL);

// API endpoint to upload file to IPFS and queue for offline delivery
app.post("/api/share/offline", async (req, res) => {
  try {
    const { senderPeerId, senderUsername, receiverPeerId, file } = req.body;

    // Check if receiver exists
    const receiver = await User.findOne({ peerId: receiverPeerId });
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Upload to IPFS using Pinata
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));

    const pinataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${process.env.PINATA_API_KEY}`,
        },
      }
    );

    const ipfsHash = pinataRes.data.IpfsHash;

    // Create message queue entry
    const message = new MessageQueue({
      senderPeerId,
      senderUsername,
      receiverPeerId,
      ipfsHash,
      fileName: file.originalname,
      fileSize: file.size,
    });

    await message.save();

    // Clean up temporary file
    fs.unlinkSync(file.path);

    res.json({
      message: "File queued for delivery",
      ipfsHash,
    });
  } catch (error) {
    console.error("❌ Error queueing file for delivery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint to get pending messages for a user
app.get("/api/messages/pending/:peerId", async (req, res) => {
  try {
    const { peerId } = req.params;
    const messages = await MessageQueue.find({
      receiverPeerId: peerId,
      status: "pending",
    }).sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching pending messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Use server instead of app for listening
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
