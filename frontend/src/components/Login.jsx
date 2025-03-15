import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MailOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
          if (!localStorage.getItem("peerId")) {
            localStorage.setItem("peerId", peerId);
          }
          if (!localStorage.getItem("username")) {
            localStorage.setItem("username", response.data.username);
          }
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
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        marginTop: 150,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title
          level={2}
          style={{ textAlign: "center", color: "#1890ff", margin: 0 }}
        >
          Welcome Back
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginTop: 8 }}
        >
          Log in to your secure P2P data sharing account
        </Text>
      </div>

      <Form onFinish={handleLogin}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Enter your Email" },
            { type: "email", message: "Invalid Email" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Email"
            size="large"
            style={{ borderRadius: 6 }}
            suffix={
              <Tooltip title="Enter the email you used to register">
                <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
              </Tooltip>
            }
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Enter your Password" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Password"
            size="large"
            style={{ borderRadius: 6 }}
            suffix={
              <Tooltip title="Enter your secure password">
                <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
              </Tooltip>
            }
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 8,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ borderRadius: 6, flex: 1 }}
            size="large"
          >
            Login
          </Button>
          <Button
            type="default"
            onClick={() => navigate("/")}
            style={{ borderRadius: 6, flex: 1 }}
            size="large"
          >
            Register
          </Button>
        </div>
      </Form>

      <Divider plain style={{ margin: "24px 0 16px" }}>
        <Text type="secondary">Secure P2P Data Sharing</Text>
      </Divider>

      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", fontSize: 12 }}
      >
        Access your network to securely share data with peers worldwide
      </Text>

      <Paragraph style={{ textAlign: "center", marginTop: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Your data stays private with direct peer-to-peer transfers.
          <Tooltip title="No third parties can access your shared files">
            <InfoCircleOutlined style={{ marginLeft: 4, color: "#bfbfbf" }} />
          </Tooltip>
        </Text>
      </Paragraph>
    </div>
  );
};

export default Login;
