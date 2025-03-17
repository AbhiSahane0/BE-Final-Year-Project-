import { Typography, Button, Row, Col, Card, Divider } from "antd";
import {
  SecurityScanOutlined,
  ThunderboltOutlined,
  LockOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { message } from "antd";

const { Title, Text, Paragraph } = Typography;

const MotionCard = motion(Card);

function Home() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
      setIsTablet(window.innerWidth >= 576 && window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const features = [
    {
      icon: (
        <SecurityScanOutlined
          style={{
            fontSize: isMobile ? "28px" : "36px",
            color: "#1890ff",
          }}
        />
      ),
      title: "Secure Sharing",
      description:
        "End-to-end encrypted file sharing with peer-to-peer technology",
    },
    {
      icon: (
        <ThunderboltOutlined
          style={{
            fontSize: isMobile ? "28px" : "36px",
            color: "#52c41a",
          }}
        />
      ),
      title: "Lightning Fast",
      description:
        "Direct peer connections ensure the fastest possible transfers",
    },
    {
      icon: (
        <LockOutlined
          style={{
            fontSize: isMobile ? "28px" : "36px",
            color: "#722ed1",
          }}
        />
      ),
      title: "Privacy First",
      description:
        "Your files never touch our servers, complete privacy guaranteed",
    },
    {
      icon: (
        <TeamOutlined
          style={{
            fontSize: isMobile ? "28px" : "36px",
            color: "#fa8c16",
          }}
        />
      ),
      title: "Easy Collaboration",
      description: "Share with anyone, anywhere, with just their peer ID",
    },
  ];

  // Hero section background style
  const heroBackground = {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    borderRadius: "12px",
    padding: isMobile ? "20px" : isTablet ? "30px" : "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  };

  const handleShareNowClick = () => {
    const isRegistered = localStorage.getItem("registered") === "true";
    if (isRegistered) {
      navigate("/DataSharing");
    } else {
      message.info("Please register first to start sharing files");
      navigate("/register");
    }
  };

  return (
    <div
      style={{
        padding: isMobile
          ? "20px 16px 40px"
          : isTablet
          ? "20px 30px 50px"
          : "20px 50px 64px",
        overflow: "hidden", // Prevent horizontal scroll on mobile
      }}
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: isMobile ? "40px" : "60px" }}
      >
        <Row
          gutter={[isMobile ? 16 : 32, isMobile ? 24 : 48]}
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
                  fontSize: isMobile ? "28px" : isTablet ? "36px" : "42px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                Secure P2P File Sharing
                <br />
                <span
                  style={{
                    color: "#1890ff",
                    fontSize: isMobile ? "32px" : isTablet ? "40px" : "48px",
                  }}
                >
                  Made Simple
                </span>
              </Title>
              <Paragraph
                style={{
                  fontSize: isMobile ? "16px" : "18px",
                  marginBottom: "32px",
                  lineHeight: "1.6",
                  color: "#555",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                BlockShare enables direct, encrypted file transfers between
                peers. No intermediaries, no size limits, just secure and
                private sharing with complete control over your data.
              </Paragraph>
              <div
                style={{
                  display: "flex",
                  justifyContent: isMobile ? "center" : "flex-start",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                  gap: isMobile ? "12px" : "16px",
                }}
              >
                <Button
                  type="primary"
                  size={isMobile ? "middle" : "large"}
                  style={{
                    height: isMobile ? "40px" : "50px",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "0 20px" : "0 30px",
                    borderRadius: "8px",
                    boxShadow: "0 5px 15px rgba(24, 144, 255, 0.3)",
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
                <Button
                  size={isMobile ? "middle" : "large"}
                  style={{
                    height: isMobile ? "40px" : "50px",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "0 20px" : "0 30px",
                    borderRadius: "8px",
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={handleShareNowClick}
                >
                  Share Now
                </Button>
              </div>
            </motion.div>
          </Col>
          <Col xs={24} lg={12} style={{ textAlign: "center" }}>
            <motion.img
              src="https://img.freepik.com/free-vector/file-sharing-abstract-concept-vector-illustration-file-hosting-peer-peer-sharing-network-data-transfer-send-document-upload-download-file-remote-team-collaboration-abstract-metaphor_335657-1761.jpg"
              alt="Secure P2P file sharing"
              style={{
                width: "100%",
                maxWidth: isMobile ? "300px" : "500px",
                borderRadius: "12px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                marginTop: isMobile ? "20px" : 0,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Section Divider */}
      <div
        style={{ textAlign: "center", margin: isMobile ? "30px 0" : "40px 0" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Title
            level={2}
            style={{
              fontSize: isMobile ? "24px" : isTablet ? "28px" : "32px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Why Choose <span style={{ color: "#1890ff" }}>BlockShare</span>
          </Title>
          <Divider>
            <RocketOutlined
              style={{
                fontSize: isMobile ? "18px" : "24px",
                color: "#1890ff",
              }}
            />
          </Divider>
        </motion.div>
      </div>

      {/* Features Section */}
      <Row
        gutter={[isMobile ? 16 : 32, isMobile ? 16 : 32]}
        style={{ marginTop: "20px" }}
      >
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
              bodyStyle={{ padding: isMobile ? "20px 15px" : "30px 20px" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
                <Title
                  level={3}
                  style={{
                    marginTop: "16px",
                    fontSize: isMobile ? "18px" : "20px",
                  }}
                >
                  {feature.title}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: isMobile ? "14px" : "15px",
                  }}
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
          marginTop: isMobile ? "50px" : isTablet ? "60px" : "80px",
          background: "linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)",
          padding: isMobile ? "25px 15px" : isTablet ? "30px" : "40px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: isMobile ? "25px" : "40px",
            fontSize: isMobile ? "24px" : isTablet ? "28px" : "32px",
          }}
        >
          How BlockShare Works
        </Title>
        <Row gutter={[isMobile ? 16 : 40, isMobile ? 16 : 40]} align="middle">
          <Col xs={24} sm={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#1890ff",
                  fontSize: isMobile ? "18px" : "20px",
                }}
              >
                1. Register
              </Title>
              <Paragraph style={{ fontSize: isMobile ? "14px" : "16px" }}>
                Create your account and get your unique peer ID for secure
                connections
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#52c41a",
                  fontSize: isMobile ? "18px" : "20px",
                }}
              >
                2. Connect
              </Title>
              <Paragraph style={{ fontSize: isMobile ? "14px" : "16px" }}>
                Enter your friend&apos;s peer ID to establish a direct,
                encrypted connection
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#722ed1",
                  fontSize: isMobile ? "18px" : "20px",
                }}
              >
                3. Share
              </Title>
              <Paragraph style={{ fontSize: isMobile ? "14px" : "16px" }}>
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
          marginTop: isMobile ? "50px" : isTablet ? "60px" : "80px",
          textAlign: "center",
          padding: isMobile
            ? "30px 15px"
            : isTablet
            ? "40px 20px"
            : "50px 20px",
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(24, 144, 255, 0.3)",
        }}
      >
        <Title
          level={2}
          style={{
            color: "white",
            marginBottom: isMobile ? "15px" : "20px",
            fontSize: isMobile ? "22px" : isTablet ? "26px" : "32px",
          }}
        >
          Ready to experience secure file sharing?
        </Title>
        <Paragraph
          style={{
            color: "white",
            fontSize: isMobile ? "15px" : isTablet ? "16px" : "18px",
            marginBottom: isMobile ? "20px" : "30px",
            padding: "0 10px",
          }}
        >
          Join thousands of users who trust BlockShare for their secure data
          transfer needs
        </Paragraph>
        <Button
          type="primary"
          size={isMobile ? "middle" : "large"}
          ghost
          style={{
            height: isMobile ? "40px" : "50px",
            fontSize: isMobile ? "14px" : "16px",
            padding: isMobile ? "0 25px" : "0 40px",
            borderRadius: "8px",
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "250px" : "auto",
          }}
          onClick={handleShareNowClick}
        >
          Start Sharing Now
        </Button>
      </motion.div>
    </div>
  );
}

export default Home;
