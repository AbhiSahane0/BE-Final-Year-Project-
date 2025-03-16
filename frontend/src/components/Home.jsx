import { Typography, Button, Row, Col, Card, Space, Divider } from "antd";
import {
  SecurityScanOutlined,
  ThunderboltOutlined,
  LockOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const MotionCard = motion(Card);

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <SecurityScanOutlined style={{ fontSize: "36px", color: "#1890ff" }} />
      ),
      title: "Secure Sharing",
      description:
        "End-to-end encrypted file sharing with peer-to-peer technology",
    },
    {
      icon: (
        <ThunderboltOutlined style={{ fontSize: "36px", color: "#52c41a" }} />
      ),
      title: "Lightning Fast",
      description:
        "Direct peer connections ensure the fastest possible transfers",
    },
    {
      icon: <LockOutlined style={{ fontSize: "36px", color: "#722ed1" }} />,
      title: "Privacy First",
      description:
        "Your files never touch our servers, complete privacy guaranteed",
    },
    {
      icon: <TeamOutlined style={{ fontSize: "36px", color: "#fa8c16" }} />,
      title: "Easy Collaboration",
      description: "Share with anyone, anywhere, with just their peer ID",
    },
  ];

  // Hero section background style
  const heroBackground = {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "20px 50px 64px" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: "60px" }}
      >
        <Row
          gutter={[32, 48]}
          align="middle"
          style={{ ...heroBackground, marginTop: "20px" }}
        >
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Title
                style={{
                  fontSize: "42px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                Secure P2P File Sharing
                <br />
                <span style={{ color: "#1890ff", fontSize: "48px" }}>
                  Made Simple
                </span>
              </Title>
              <Paragraph
                style={{
                  fontSize: "18px",
                  marginBottom: "32px",
                  lineHeight: "1.6",
                  color: "#555",
                }}
              >
                BlockShare enables direct, encrypted file transfers between
                peers. No intermediaries, no size limits, just secure and
                private sharing with complete control over your data.
              </Paragraph>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    padding: "0 30px",
                    borderRadius: "8px",
                    boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
                  }}
                  onClick={() => navigate("/")}
                >
                  Get Started
                </Button>
                <Button
                  size="large"
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    padding: "0 30px",
                    borderRadius: "8px",
                  }}
                  onClick={() => navigate("/DataSharing")}
                >
                  Share Now
                </Button>
              </Space>
            </motion.div>
          </Col>
          <Col xs={24} lg={12} style={{ textAlign: "center" }}>
            <motion.img
              src="https://img.freepik.com/free-vector/file-sharing-abstract-concept-vector-illustration-file-hosting-peer-peer-sharing-network-data-transfer-send-document-upload-download-file-remote-team-collaboration-abstract-metaphor_335657-1761.jpg"
              alt="Secure P2P file sharing"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "12px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Section Divider */}
      <div style={{ textAlign: "center", margin: "40px 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Title
            level={2}
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Why Choose <span style={{ color: "#1890ff" }}>BlockShare</span>
          </Title>
          <Divider>
            <RocketOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          </Divider>
        </motion.div>
      </div>

      {/* Features Section */}
      <Row gutter={[32, 32]} style={{ marginTop: "20px" }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <MotionCard
              hoverable
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              style={{
                height: "100%",
                textAlign: "center",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
              }}
              bodyStyle={{ padding: "30px 20px" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
                <Title
                  level={3}
                  style={{ marginTop: "16px", fontSize: "20px" }}
                >
                  {feature.title}
                </Title>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "15px" }}
                >
                  {feature.description}
                </Text>
              </motion.div>
            </MotionCard>
          </Col>
        ))}
      </Row>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        style={{
          marginTop: "80px",
          background: "linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "32px",
          }}
        >
          How BlockShare Works
        </Title>
        <Row gutter={[40, 40]} align="middle">
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ color: "#1890ff" }}>
                1. Register
              </Title>
              <Paragraph>
                Create your account and get your unique peer ID for secure
                connections
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ color: "#52c41a" }}>
                2. Connect
              </Title>
              <Paragraph>
                Enter your friend&apos;s peer ID to establish a direct,
                encrypted connection
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ color: "#722ed1" }}>
                3. Share
              </Title>
              <Paragraph>
                Transfer files of any size with complete privacy and security
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        style={{
          marginTop: "80px",
          textAlign: "center",
          padding: "50px 20px",
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(24, 144, 255, 0.3)",
        }}
      >
        <Title level={2} style={{ color: "white", marginBottom: "20px" }}>
          Ready to experience secure file sharing?
        </Title>
        <Paragraph
          style={{ color: "white", fontSize: "18px", marginBottom: "30px" }}
        >
          Join thousands of users who trust BlockShare for their secure data
          transfer needs
        </Paragraph>
        <Button
          type="primary"
          size="large"
          ghost
          style={{
            height: "50px",
            fontSize: "16px",
            padding: "0 40px",
            borderRadius: "8px",
          }}
          onClick={() => navigate("/login")}
        >
          Start Sharing Now
        </Button>
      </motion.div>
    </div>
  );
}

export default Home;
