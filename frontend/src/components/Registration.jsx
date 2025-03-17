import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
  Tooltip,
  Popover,
  Steps,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  LockFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const Registration = () => {
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user is already registered
  useEffect(() => {
    const registered = localStorage.getItem("registered");
    if (registered === "true") {
      navigate("/DataSharing");
    }
  }, [navigate]);

  // Update step based on verification status
  useEffect(() => {
    if (otpVerified) {
      setCurrentStep(2);
    } else if (otpSent) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [otpSent, otpVerified]);

  // Send OTP
  const sendOtp = async () => {
    // Get email from form to ensure it's the most up-to-date value
    const formEmail = form.getFieldValue("email");
    if (!formEmail) {
      message.error("Please enter your email address");
      return;
    }

    setEmail(formEmail); // Update email state with form value

    try {
      setLoadingOtp(true);
      message.loading("Sending verification code...", 1);

      const response = await axios.post("http://localhost:5000/send-otp", {
        email: formEmail,
      });

      console.log("OTP send response:", response.data);
      message.success(
        "Verification code sent successfully! Check your email inbox and spam folder."
      );
      setOtpSent(true);
    } catch (error) {
      console.error("OTP send error:", error);
      if (error.response?.data?.details) {
        console.error("Error details:", error.response.data.details);
      }
      message.error(
        error.response?.data?.error ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (values) => {
    try {
      setLoading(true);
      const formEmail = form.getFieldValue("email");
      const formOtp = values.otp;

      if (!formEmail || !formOtp) {
        message.error("Please enter both email and OTP");
        return;
      }

      const response = await axios.post("http://localhost:5000/verify-otp", {
        email: formEmail,
        otp: formOtp,
      });

      if (response.data.message === "OTP verified successfully") {
        message.success("Email verified successfully!");
        setOtpVerified(true);
        // Clear only the OTP field
        form.setFieldValue("otp", undefined);
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      message.error(
        error.response?.data?.error ||
          "Verification failed. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Register User
  const registerUser = async (values) => {
    if (!otpVerified) {
      message.error("Please verify your email first");
      return;
    }

    try {
      setLoading(true);
      const formEmail = form.getFieldValue("email");
      const formUsername = values.username;
      const formPassword = values.password;

      if (!formEmail || !formUsername || !formPassword) {
        message.error("Please fill in all required fields");
        return;
      }

      console.log("Starting registration with data:", {
        username: formUsername,
        email: formEmail,
      });

      const response = await axios.post("http://localhost:5000/register", {
        username: formUsername,
        email: formEmail,
        password: formPassword,
      });

      console.log("Server response:", response.data);

      if (response.data && response.data.peerId) {
        // Store user data in localStorage
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("peerId", response.data.peerId);
        localStorage.setItem("registered", "true");
        localStorage.setItem("email", response.data.email);

        message.success("Registration successful!");

        // Clear form
        form.resetFields();

        // Navigate to DataSharing
        navigate("/DataSharing", { replace: true });
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Registration error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      message.error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Security info content for the Popover
  const securityInfo = (
    <div style={{ maxWidth: 300 }}>
      <Paragraph>
        <Text strong>Why Our Platform is Secure:</Text>
      </Paragraph>
      <Paragraph>
        <SafetyCertificateOutlined />{" "}
        <Text strong>Peer-to-Peer Technology:</Text> Your data transfers
        directly between users without passing through central servers.
      </Paragraph>
      <Paragraph>
        <SafetyCertificateOutlined /> <Text strong>Unique Peer ID:</Text> Your
        personal identifier enables secure connections while maintaining
        privacy.
      </Paragraph>
      <Paragraph>
        <SafetyCertificateOutlined /> <Text strong>End-to-End Security:</Text>{" "}
        Your data remains encrypted and is never stored on our servers.
      </Paragraph>
    </div>
  );

  // Peer ID info content
  const peerIdInfo = (
    <div style={{ maxWidth: 250 }}>
      <Paragraph>
        <Text strong>Your Secure Peer ID</Text>
      </Paragraph>
      <Paragraph>
        This unique identifier allows you to share data directly with other
        users without intermediaries, enhancing privacy and security.
      </Paragraph>
      <Paragraph>
        <Text type="warning">
          Keep this ID safe - its your key to the P2P network.
        </Text>
      </Paragraph>
    </div>
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        maxWidth: 480,
        margin: "auto",
        padding: "30px",
        marginTop: 30,
        background: "white",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(24, 144, 255, 0.1)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "150px",
          height: "150px",
          background:
            "linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)",
          borderRadius: "0 0 0 100%",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "120px",
          height: "120px",
          background:
            "linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.03) 100%)",
          borderRadius: "0 100% 0 0",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              margin: 0,
              background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "32px",
            }}
          >
            Join BlockShare
          </Title>
          <Popover
            content={securityInfo}
            title="Secure P2P Data Sharing"
            trigger="hover"
            placement="right"
          >
            <SecurityScanOutlined
              style={{ marginLeft: 12, color: "#1890ff", fontSize: 20 }}
            />
          </Popover>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Steps
            current={currentStep}
            style={{ marginBottom: 30 }}
            responsive={true}
          >
            <Step title="Account" icon={<UserOutlined />} />
            <Step title="Verify" icon={<SafetyCertificateOutlined />} />
            <Step title="Complete" icon={<CheckCircleOutlined />} />
          </Steps>
        </motion.div>

        <Form
          form={form}
          onFinish={async (values) => {
            if (!otpVerified) {
              await verifyOtp(values);
            } else {
              await registerUser(values);
            }
          }}
          layout="vertical"
        >
          <motion.div variants={itemVariants}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Enter Username" }]}
              label={<span style={{ fontSize: "16px" }}>Username</span>}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                placeholder="Choose a username"
                size="large"
                style={{
                  borderRadius: 8,
                  height: "50px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
                suffix={
                  <Tooltip title="Your unique username for connecting with peers">
                    <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Enter Email" },
                { type: "email", message: "Invalid Email" },
              ]}
              label={<span style={{ fontSize: "16px" }}>Email</span>}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#1890ff" }} />}
                placeholder="Your email address"
                onChange={(e) => setEmail(e.target.value)}
                size="large"
                style={{
                  borderRadius: 8,
                  height: "50px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
                suffix={
                  <Tooltip title="We'll send a verification code to this email">
                    <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                  </Tooltip>
                }
                disabled={otpSent}
              />
            </Form.Item>
          </motion.div>

          {!otpSent && (
            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                gap: 12,
              }}
            >
              <Button
                type="primary"
                onClick={sendOtp}
                disabled={!form.getFieldValue("email") || loadingOtp}
                style={{
                  borderRadius: 8,
                  flex: 1,
                  height: "50px",
                  background:
                    "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
                }}
                size="large"
                icon={<SafetyCertificateOutlined />}
                loading={loadingOtp}
              >
                Verify Email
              </Button>
              <Button
                type="default"
                onClick={() => navigate("/login")}
                style={{
                  borderRadius: 8,
                  flex: 1,
                  height: "50px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                }}
                size="large"
              >
                Login
              </Button>
            </motion.div>
          )}

          {otpSent && !otpVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                style={{
                  marginBottom: 24,
                  borderRadius: 12,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Title
                  level={4}
                  style={{ textAlign: "center", marginBottom: 20 }}
                >
                  Verify Your Email
                </Title>
                <Paragraph style={{ textAlign: "center", marginBottom: 20 }}>
                  We&apos;ve sent a verification code to{" "}
                  <Text strong>{email}</Text>. Please check your inbox and enter
                  the code below.
                </Paragraph>
                <Form.Item
                  name="otp"
                  rules={[{ required: true, message: "Enter OTP" }]}
                >
                  <Input
                    prefix={
                      <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
                    }
                    placeholder="Enter verification code"
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: "50px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      fontSize: "18px",
                      textAlign: "center",
                      letterSpacing: "8px",
                    }}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    borderRadius: 8,
                    height: "50px",
                    background:
                      "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                    border: "none",
                    boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
                  }}
                >
                  Verify Code
                </Button>
                <Button
                  type="link"
                  onClick={sendOtp}
                  disabled={loadingOtp}
                  style={{ width: "100%", marginTop: 12 }}
                >
                  {loadingOtp ? "Sending..." : "Resend Verification Code"}
                </Button>
              </Card>
            </motion.div>
          )}

          {otpVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Enter Password" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters",
                  },
                ]}
                label={<span style={{ fontSize: "16px" }}>Password</span>}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#1890ff" }} />}
                  placeholder="Create a secure password"
                  size="large"
                  style={{
                    borderRadius: 8,
                    height: "50px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  suffix={
                    <Tooltip title="Choose a strong password to secure your account">
                      <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                    </Tooltip>
                  }
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  borderRadius: 8,
                  height: "50px",
                  background:
                    "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
                  marginTop: 8,
                }}
                icon={<RocketOutlined />}
              >
                Complete Registration
              </Button>
            </motion.div>
          )}
        </Form>

        <motion.div variants={itemVariants}>
          <Divider style={{ margin: "30px 0 20px" }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Secure P2P Data Sharing
            </Text>
          </Divider>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)",
              borderRadius: 12,
              border: "none",
              marginTop: 16,
            }}
          >
            <Paragraph style={{ textAlign: "center", margin: 0 }}>
              <Text style={{ fontSize: 14 }}>
                <LockFilled style={{ color: "#52c41a", marginRight: 8 }} />
                Your data stays private with direct peer-to-peer transfers.
                <Tooltip title="No third parties can access your shared files">
                  <InfoCircleOutlined
                    style={{ marginLeft: 8, color: "#bfbfbf" }}
                  />
                </Tooltip>
              </Text>
            </Paragraph>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Registration;
