// import { useEffect, useState } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   message,
//   Typography,
//   Divider,
//   Tooltip,
//   Popover,
// } from "antd";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   UserOutlined,
//   MailOutlined,
//   LockOutlined,
//   SafetyCertificateOutlined,
//   InfoCircleOutlined,
// } from "@ant-design/icons";

// const { Title, Text, Paragraph } = Typography;

// const Registration = () => {
//   const [form] = Form.useForm();
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [peerId, setPeerId] = useState("");
//   const navigate = useNavigate();

//   // Check if user is already registered
//   useEffect(() => {
//     const registered = localStorage.getItem("registered");
//     if (registered === "true") {
//       navigate("/DataSharing");
//     }
//   }, [navigate]);

//   // Send OTP
//   const sendOtp = async () => {
//     try {
//       setLoading(true);

//       // Basic email validation
//       if (!email || !email.includes("@")) {
//         message.error("Please enter a valid email address");
//         return;
//       }

//       const response = await axios.post(
//         "http://localhost:5000/send-otp",
//         {
//           email,
//         },
//         {
//           // Add timeout and headers
//           timeout: 10000,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         message.success("OTP sent successfully! Please check your email.");
//         setOtpSent(true);
//       } else {
//         message.error(response.data.error || "Failed to send OTP");
//       }
//     } catch (error) {
//       console.error("OTP Send Error:", error);

//       // More detailed error handling
//       if (error.response) {
//         // Server responded with error
//         message.error(
//           error.response.data.error || "Server error while sending OTP"
//         );
//       } else if (error.request) {
//         // Request made but no response
//         message.error("No response from server. Please try again.");
//       } else {
//         // Error in request setup
//         message.error("Error sending request. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP
//   const verifyOtp = async (values) => {
//     try {
//       setLoading(true);
//       const response = await axios.post("http://localhost:5000/verify-otp", {
//         email,
//         otp: values.otp,
//       });
//       message.success(response.data.message);
//       setOtpVerified(true);

//       // Generate Peer ID
//       const generatedPeerId = `peer-${Math.random()
//         .toString(36)
//         .substring(2, 15)}`;
//       console.log("Generated Peer ID:", generatedPeerId);
//       setPeerId(generatedPeerId);
//     } catch (error) {
//       message.error(error.response?.data?.error || "OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Register User
//   const registerUser = async (values) => {
//     if (!otpVerified) {
//       message.error("Please verify OTP first");
//       return;
//     }
//     try {
//       setLoading(true);
//       const response = await axios.post("http://localhost:5000/register", {
//         username: values.username,
//         email,
//         password: values.password,
//         peerId,
//       });
//       message.success(response.data.message);

//       // Store user details in localStorage
//       localStorage.setItem("username", values.username);
//       localStorage.setItem("peerId", peerId);
//       localStorage.setItem("registered", "true");

//       // Navigate to home
//       navigate("/DataSharing");
//     } catch (error) {
//       message.error(error.response?.data?.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Security info content for the Popover
//   const securityInfo = (
//     <div style={{ maxWidth: 300 }}>
//       <Paragraph>
//         <Text strong>Why Our Platform is Secure:</Text>
//       </Paragraph>
//       <Paragraph>
//         <SafetyCertificateOutlined />{" "}
//         <Text strong>Peer-to-Peer Technology:</Text> Your data transfers
//         directly between users without passing through central servers.
//       </Paragraph>
//       <Paragraph>
//         <SafetyCertificateOutlined /> <Text strong>Unique Peer ID:</Text> Your
//         personal identifier enables secure connections while maintaining
//         privacy.
//       </Paragraph>
//       <Paragraph>
//         <SafetyCertificateOutlined /> <Text strong>End-to-End Security:</Text>{" "}
//         Your data remains encrypted and is never stored on our servers.
//       </Paragraph>
//     </div>
//   );

//   // Peer ID info content
//   const peerIdInfo = (
//     <div style={{ maxWidth: 250 }}>
//       <Paragraph>
//         <Text strong>Your Secure Peer ID</Text>
//       </Paragraph>
//       <Paragraph>
//         This unique identifier allows you to share data directly with other
//         users without intermediaries, enhancing privacy and security.
//       </Paragraph>
//       <Paragraph>
//         <Text type="warning">
//           Keep this ID safe - it&apos;s your key to the P2P network.
//         </Text>
//       </Paragraph>
//     </div>
//   );

//   return (
//     <div
//       style={{
//         maxWidth: 400,
//         margin: "auto",
//         padding: 20,
//         marginTop: 150,
//         background: "white",
//         borderRadius: 12,
//         boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
//         // marginTop: 200,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           marginBottom: 24,
//         }}
//       >
//         <Title
//           level={2}
//           style={{ textAlign: "center", color: "#1890ff", margin: 0 }}
//         >
//           Register
//         </Title>
//         <Popover
//           content={securityInfo}
//           title="Secure P2P Data Sharing"
//           trigger="hover"
//           placement="right"
//         >
//           <InfoCircleOutlined
//             style={{ marginLeft: 8, color: "#1890ff", fontSize: 16 }}
//           />
//         </Popover>
//       </div>

//       <Form
//         form={form}
//         onFinish={otpSent && otpVerified ? registerUser : verifyOtp}
//       >
//         <Form.Item
//           name="username"
//           rules={[{ required: true, message: "Enter Username" }]}
//         >
//           <Input
//             prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
//             placeholder="Username"
//             size="large"
//             style={{ borderRadius: 6 }}
//             suffix={
//               <Tooltip title="Your unique username for connecting with peers">
//                 <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
//               </Tooltip>
//             }
//           />
//         </Form.Item>

//         <Form.Item
//           name="email"
//           rules={[
//             { required: true, message: "Enter Email" },
//             { type: "email", message: "Invalid Email" },
//           ]}
//         >
//           <Input
//             prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
//             placeholder="Email"
//             onChange={(e) => setEmail(e.target.value)}
//             size="large"
//             style={{ borderRadius: 6 }}
//             suffix={
//               <Tooltip title="We'll send a verification code to this email">
//                 <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
//               </Tooltip>
//             }
//           />
//         </Form.Item>

//         {!otpSent && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: 16,
//               gap: 8,
//             }}
//           >
//             <Button
//               type="primary"
//               onClick={sendOtp}
//               disabled={!email || loading}
//               style={{ borderRadius: 6, flex: 1 }}
//               size="large"
//               icon={<SafetyCertificateOutlined />}
//               loading={loading}
//             >
//               Verify Email
//             </Button>
//             <Button
//               type="default"
//               onClick={() => navigate("/login")}
//               style={{ borderRadius: 6, flex: 1 }}
//               size="large"
//             >
//               Login
//             </Button>
//           </div>
//         )}

//         {otpSent && !otpVerified && (
//           <>
//             <Form.Item
//               name="otp"
//               rules={[{ required: true, message: "Enter OTP" }]}
//             >
//               <Input
//                 prefix={
//                   <SafetyCertificateOutlined style={{ color: "#bfbfbf" }} />
//                 }
//                 placeholder="Enter OTP"
//                 size="large"
//                 style={{ borderRadius: 6 }}
//                 suffix={
//                   <Tooltip title="Enter the verification code sent to your email">
//                     <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
//                   </Tooltip>
//                 }
//               />
//             </Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               block
//               size="large"
//               style={{ borderRadius: 6 }}
//             >
//               Verify OTP
//             </Button>
//           </>
//         )}

//         {otpVerified && (
//           <>
//             {peerId && (
//               <div
//                 style={{
//                   marginBottom: 16,
//                   background: "#f9f9f9",
//                   padding: 12,
//                   borderRadius: 6,
//                   border: "1px solid #d9d9d9",
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center" }}>
//                   <Text strong style={{ marginRight: 8 }}>
//                     Your Peer ID:
//                   </Text>
//                   <Popover
//                     content={peerIdInfo}
//                     title="About Peer ID"
//                     trigger="hover"
//                   >
//                     <InfoCircleOutlined style={{ color: "#1890ff" }} />
//                   </Popover>
//                 </div>
//                 <Text
//                   code
//                   copyable
//                   style={{ width: "100%", display: "block", marginTop: 8 }}
//                 >
//                   {peerId}
//                 </Text>
//                 <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
//                   This ID enables secure P2P data sharing
//                 </Text>
//               </div>
//             )}

//             <Form.Item
//               name="password"
//               rules={[
//                 { required: true, message: "Enter Password" },
//                 { min: 6, message: "Password must be at least 6 characters" },
//               ]}
//             >
//               <Input.Password
//                 prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
//                 placeholder="Password"
//                 size="large"
//                 style={{ borderRadius: 6 }}
//                 suffix={
//                   <Tooltip title="Choose a strong password to secure your account">
//                     <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
//                   </Tooltip>
//                 }
//               />
//             </Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               block
//               size="large"
//               style={{ borderRadius: 6 }}
//             >
//               Register
//             </Button>
//           </>
//         )}
//       </Form>

//       <Divider plain style={{ margin: "24px 0 16px" }}>
//         <Text type="secondary">Secure P2P Data Sharing</Text>
//       </Divider>

//       <Text
//         type="secondary"
//         style={{ display: "block", textAlign: "center", fontSize: 12 }}
//       >
//         Join our network to securely share data with peers worldwide
//       </Text>

//       <Paragraph style={{ textAlign: "center", marginTop: 12 }}>
//         <Text type="secondary" style={{ fontSize: 12 }}>
//           Your data stays private with direct peer-to-peer transfers.
//           <Tooltip title="No third parties can access your shared files">
//             <InfoCircleOutlined style={{ marginLeft: 4, color: "#bfbfbf" }} />
//           </Tooltip>
//         </Text>
//       </Paragraph>
//     </div>
//   );
// };

// export default Registration;

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
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const Registration = () => {
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [peerId, setPeerId] = useState("");
  const navigate = useNavigate();

  // Check if user is already registered
  useEffect(() => {
    const registered = localStorage.getItem("registered");
    if (registered === "true") {
      navigate("/DataSharing");
    }
  }, [navigate]);

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
      // Use the form value for email to ensure consistency
      const formEmail = form.getFieldValue("email");

      console.log("Verifying OTP:", {
        email: formEmail,
        otp: values.otp,
      });

      const response = await axios.post("http://localhost:5000/verify-otp", {
        email: formEmail,
        otp: values.otp,
      });

      console.log("OTP verification response:", response.data);
      message.success("Email verified successfully!");
      setOtpVerified(true);

      // Generate Peer ID
      const generatedPeerId = `peer-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      console.log("Generated Peer ID:", generatedPeerId);
      setPeerId(generatedPeerId);
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
      // Use the form values directly to ensure consistency
      const formEmail = form.getFieldValue("email");

      console.log("Registering user:", {
        username: values.username,
        email: formEmail,
        password: values.password,
        peerId: peerId,
      });

      const response = await axios.post("http://localhost:5000/register", {
        username: values.username,
        email: formEmail,
        password: values.password,
        peerId,
      });

      console.log("Registration response:", response.data);
      message.success("Registration successful!");

      // Store user details in localStorage
      localStorage.setItem("username", values.username);
      localStorage.setItem("peerId", peerId);
      localStorage.setItem("registered", "true");

      // Navigate to home
      navigate("/DataSharing");
    } catch (error) {
      console.error("Registration error:", error);
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

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        marginTop: 50,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", color: "#1890ff", margin: 0 }}
        >
          Register
        </Title>
        <Popover
          content={securityInfo}
          title="Secure P2P Data Sharing"
          trigger="hover"
          placement="right"
        >
          <InfoCircleOutlined
            style={{ marginLeft: 8, color: "#1890ff", fontSize: 16 }}
          />
        </Popover>
      </div>

      <Form
        form={form}
        onFinish={otpSent && otpVerified ? registerUser : verifyOtp}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Enter Username" }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Username"
            size="large"
            style={{ borderRadius: 6 }}
            suffix={
              <Tooltip title="Your unique username for connecting with peers">
                <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
              </Tooltip>
            }
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Enter Email" },
            { type: "email", message: "Invalid Email" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            size="large"
            style={{ borderRadius: 6 }}
            suffix={
              <Tooltip title="We'll send a verification code to this email">
                <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
              </Tooltip>
            }
          />
        </Form.Item>

        {!otpSent && (
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
              onClick={sendOtp}
              disabled={!form.getFieldValue("email") || loadingOtp}
              style={{ borderRadius: 6, flex: 1 }}
              size="large"
              icon={<SafetyCertificateOutlined />}
              loading={loadingOtp}
            >
              Verify Email
            </Button>
            <Button
              type="default"
              onClick={() => navigate("/login")}
              style={{ borderRadius: 6, flex: 1 }}
              size="large"
            >
              Login
            </Button>
          </div>
        )}

        {otpSent && !otpVerified && (
          <>
            <Form.Item
              name="otp"
              rules={[{ required: true, message: "Enter OTP" }]}
            >
              <Input
                prefix={
                  <SafetyCertificateOutlined style={{ color: "#bfbfbf" }} />
                }
                placeholder="Enter OTP"
                size="large"
                style={{ borderRadius: 6 }}
                suffix={
                  <Tooltip title="Enter the verification code sent to your email">
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
              style={{ borderRadius: 6 }}
            >
              Verify OTP
            </Button>
            <Button
              type="link"
              onClick={sendOtp}
              disabled={loadingOtp}
              style={{ width: "100%", marginTop: 8 }}
            >
              {loadingOtp ? "Sending..." : "Resend Verification Code"}
            </Button>
          </>
        )}

        {otpVerified && (
          <>
            {peerId && (
              <div
                style={{
                  marginBottom: 16,
                  background: "#f9f9f9",
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text strong style={{ marginRight: 8 }}>
                    Your Peer ID:
                  </Text>
                  <Popover
                    content={peerIdInfo}
                    title="About Peer ID"
                    trigger="hover"
                  >
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  </Popover>
                </div>
                <Text
                  code
                  copyable
                  style={{ width: "100%", display: "block", marginTop: 8 }}
                >
                  {peerId}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  This ID enables secure P2P data sharing
                </Text>
              </div>
            )}

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Enter Password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Password"
                size="large"
                style={{ borderRadius: 6 }}
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
              style={{ borderRadius: 6 }}
            >
              Register
            </Button>
          </>
        )}
      </Form>

      <Divider plain style={{ margin: "24px 0 16px" }}>
        <Text type="secondary">Secure P2P Data Sharing</Text>
      </Divider>

      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", fontSize: 12 }}
      >
        Join our network to securely share data with peers worldwide
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

export default Registration;
