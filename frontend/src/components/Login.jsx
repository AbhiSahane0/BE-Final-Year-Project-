import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
  Tooltip,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MailOutlined,
  LockOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Check if user is already registered
  useEffect(() => {
    const registered = localStorage.getItem("registered");
    if (registered === "true") {
      navigate("/DataSharing");
    }
  }, [navigate]);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      // First login request
      const response = await axios.post("http://localhost:5000/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        try {
          // Verify user and get Peer ID
          const peerResponse = await axios.post(
            "http://localhost:5000/verify-user",
            {
              email: values.email,
            }
          );

          const peerId = peerResponse.data.peerId;
          console.log("Fetched Peer ID:", peerId);

          // Store user details in localStorage
          const userData = {
            peerId,
            username: response.data.username,
            email: values.email,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("registered", "true");

          // Show success message only after everything is complete
          message.success("Login successful!");
          navigate("/DataSharing");
        } catch (peerError) {
          // Handle peer verification error separately
          message.error("Error fetching user details. Please try again.");
          console.error("Peer verification error:", peerError);
        }
      }
    } catch (error) {
      message.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          overflow: "hidden",
          border: "none",
        }}
      >
        <motion.div variants={itemVariants}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 30,
            }}
          >
            <SecurityScanOutlined
              style={{
                fontSize: 28,
                color: "#1890ff",
                marginRight: 12,
              }}
            />
            <Title
              level={2}
              style={{
                margin: 0,
                background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back
            </Title>
          </div>
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: 30,
              fontSize: 16,
            }}
          >
            Log in to your secure P2P data sharing account
          </Text>
        </motion.div>

        <Form form={form} onFinish={handleLogin} layout="vertical">
          <motion.div variants={itemVariants}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Enter your Email" },
                { type: "email", message: "Invalid Email" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#1890ff" }} />}
                placeholder="Email"
                size="large"
                style={{
                  borderRadius: 8,
                  height: "50px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
                suffix={
                  <Tooltip title="Enter the email you used to register">
                    <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Enter your Password" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#1890ff" }} />}
                placeholder="Password"
                size="large"
                style={{
                  borderRadius: 8,
                  height: "50px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
                suffix={
                  <Tooltip title="Enter your secure password">
                    <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              style={{
                flex: 1,
                height: "50px",
                borderRadius: 8,
                background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
              }}
              size="large"
            >
              Login
            </Button>
            <Button
              type="default"
              onClick={() => navigate("/Register")}
              icon={<UserAddOutlined />}
              style={{
                flex: 1,
                height: "50px",
                borderRadius: 8,
                borderColor: "#1890ff",
                color: "#1890ff",
              }}
              size="large"
            >
              Register
            </Button>
          </motion.div>
        </Form>

        <motion.div variants={itemVariants}>
          <Divider style={{ margin: "24px 0" }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Secure P2P Data Sharing
            </Text>
          </Divider>

          <Card
            style={{
              background: "linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)",
              borderRadius: 12,
              border: "1px solid #e6f7ff",
              marginTop: 16,
            }}
          >
            <Paragraph style={{ textAlign: "center", margin: 0 }}>
              <Text style={{ fontSize: 14 }}>
                Your data stays private with direct peer-to-peer transfers
                <Tooltip title="No third parties can access your shared files">
                  <InfoCircleOutlined
                    style={{ marginLeft: 8, color: "#1890ff" }}
                  />
                </Tooltip>
              </Text>
            </Paragraph>
          </Card>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default Login;
