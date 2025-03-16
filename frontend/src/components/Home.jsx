import { Typography, Button, Row, Col, Card, Space } from "antd";
import {
  SecurityScanOutlined,
  ThunderboltOutlined,
  LockOutlined,
  TeamOutlined,
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

  return (
    <div style={{ padding: "64px 50px" }}>
      <Row
        gutter={[32, 48]}
        align="middle"
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title>
              Secure P2P File Sharing
              <br />
              <span style={{ color: "#1890ff" }}>Made Simple</span>
            </Title>
            <Paragraph style={{ fontSize: "18px", marginBottom: "32px" }}>
              BlockShare enables direct, encrypted file transfers between peers.
              No servers, no limits, just secure sharing.
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
              <Button size="large" onClick={() => navigate("/about")}>
                Learn More
              </Button>
            </Space>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.img
            src="/path-to-your-hero-image.png" // Add your hero image
            alt="Secure file sharing"
            style={{ width: "100%", maxWidth: "600px" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ marginTop: "64px" }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <MotionCard
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ height: "100%", textAlign: "center" }}
            >
              {feature.icon}
              <Title level={3} style={{ marginTop: "16px" }}>
                {feature.title}
              </Title>
              <Text type="secondary">{feature.description}</Text>
            </MotionCard>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Home;
