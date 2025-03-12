require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ Connect to Redis
const redis = new Redis(REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redis
  .ping()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => console.error("❌ Redis connection failed:", err));

// ✅ User Schema
const User = require("./Users");

// ✅ SMTP Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 📌 Step 1: Send OTP
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    await redis.del(email);

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Store OTP in Redis (expires in 5 minutes)
    await redis.setex(email, 300, otp);

    // ✅ Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Step 2: Verify OTP
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    // ✅ Retrieve OTP from Redis
    const storedOtp = await redis.get(email);

    if (!storedOtp)
      return res.status(400).json({ error: "OTP expired or invalid" });

    if (storedOtp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    // ✅ OTP verified, delete from Redis
    await redis.del(email);

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Step 3: Register User
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // ✅ Check if email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // ✅ Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already taken! Please use another username...",
      });
    }

    // ✅ Generate a unique Peer ID
    const peerId = `peer-${Math.random().toString(36).substring(2, 15)}`;
    console.log(`✅ Generated Peer ID: ${peerId}`); // Logging Peer ID

    // ✅ Create a new user
    const newUser = new User({ username, email, password, peerId });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      username,
      email,
      peerId,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Step 4: User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Compare passwords (without hashing, since you opted out of bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      username: user.username,
      email: user.email,
      peerId: user.peerId,
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Step 5: Verify User
app.post("/verify-user", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // ✅ Check if the user exists in the database
    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        exists: true,
        username: user.username,
        peerId: user.peerId,
      });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("❌ Error verifying user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
