import { Typography, Row, Col, Card, Avatar, Timeline, Space } from "antd";
import {
  RocketOutlined,
  TeamOutlined,
  TrophyOutlined,
  SafetyOutlined,
  HistoryOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Team members data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      description:
        "Cybersecurity expert with 10+ years experience in P2P technologies.",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      description:
        "Blockchain specialist focused on building secure decentralized systems.",
    },
    {
      name: "Michael Rodriguez",
      role: "Lead Developer",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      description:
        "Full-stack developer passionate about creating seamless user experiences.",
    },
    {
      name: "Priya Sharma",
      role: "Security Architect",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      description:
        "Expert in encryption protocols and secure data transmission.",
    },
  ];

  return (
    <div
      style={{
        padding: "20px 5% 64px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <Row
          justify="center"
          align="middle"
          style={{
            textAlign: "center",
            marginBottom: "40px",
            marginTop: "20px",
          }}
        >
          <Col xs={24} md={20} lg={16}>
            <Title
              level={1}
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                marginBottom: "24px",
                background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              About BlockShare
            </Title>
            <Paragraph
              style={{
                fontSize: "clamp(16px, 2vw, 18px)",
                lineHeight: "1.8",
                marginBottom: "32px",
              }}
            >
              We&apos;re on a mission to revolutionize file sharing with secure,
              private, and direct peer-to-peer technology. BlockShare was
              founded on the principle that your data belongs to you, and
              sharing it should be simple, fast, and secure.
            </Paragraph>
          </Col>
        </Row>
      </motion.div>

      {/* Vision & Mission */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Row gutter={[16, 24]} style={{ marginBottom: "40px" }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <RocketOutlined
                    style={{ fontSize: 24, color: "#1890ff", marginRight: 12 }}
                  />
                  <span style={{ fontSize: "clamp(18px, 2vw, 20px)" }}>
                    Our Vision
                  </span>
                </div>
              }
              style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Paragraph
                style={{
                  fontSize: "clamp(14px, 1.6vw, 16px)",
                  lineHeight: "1.8",
                }}
              >
                To create a world where data sharing is truly private, secure,
                and controlled by users, not corporations. We envision a
                decentralized internet where individuals have complete ownership
                of their digital content.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <SafetyOutlined
                    style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }}
                  />
                  <span style={{ fontSize: "clamp(18px, 2vw, 20px)" }}>
                    Our Mission
                  </span>
                </div>
              }
              style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Paragraph
                style={{
                  fontSize: "clamp(14px, 1.6vw, 16px)",
                  lineHeight: "1.8",
                }}
              >
                To provide the most secure, efficient, and user-friendly
                peer-to-peer file sharing platform that respects privacy,
                eliminates intermediaries, and empowers users with complete
                control over their data.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Our Story */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ marginBottom: "50px" }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: "40px",
            position: "relative",
            fontSize: "clamp(24px, 3vw, 32px)",
          }}
        >
          <span
            style={{
              position: "relative",
              zIndex: 1,
              background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Our Story
          </span>
          <div
            style={{
              position: "absolute",
              height: "6px",
              width: "60px",
              background: "#1890ff",
              bottom: "-16px",
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "4px",
            }}
          />
        </Title>

        <Row gutter={[16, 32]} align="middle">
          <Col xs={24} md={12} order={{ xs: 2, md: 1 }}>
            <motion.img
              src="https://img.freepik.com/free-vector/team-concept-illustration_114360-678.jpg"
              alt="Our team working together"
              style={{
                width: "100%",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
          </Col>
          <Col xs={24} md={12} order={{ xs: 1, md: 2 }}>
            <Timeline
              mode={window.innerWidth < 768 ? "left" : "alternate"}
              items={[
                {
                  color: "#1890ff",
                  children: (
                    <Space direction="vertical" size={4}>
                      <Title
                        level={4}
                        style={{
                          fontSize: "clamp(18px, 2vw, 20px)",
                          margin: 0,
                        }}
                      >
                        2020: The Beginning
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "clamp(14px, 1.6vw, 16px)",
                          margin: 0,
                        }}
                      >
                        BlockShare was born from a simple idea: what if we could
                        share files directly without relying on cloud services?
                        Our founders came together during a hackathon to create
                        the first prototype.
                      </Paragraph>
                    </Space>
                  ),
                  dot: <HistoryOutlined style={{ fontSize: "16px" }} />,
                },
                {
                  color: "#52c41a",
                  children: (
                    <Space direction="vertical" size={4}>
                      <Title
                        level={4}
                        style={{
                          fontSize: "clamp(18px, 2vw, 20px)",
                          margin: 0,
                        }}
                      >
                        2021: Building the Foundation
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "clamp(14px, 1.6vw, 16px)",
                          margin: 0,
                        }}
                      >
                        We developed our core P2P technology and focused on
                        creating a secure, encrypted file transfer system that
                        would protect user privacy at all costs.
                      </Paragraph>
                    </Space>
                  ),
                  dot: <SafetyOutlined style={{ fontSize: "16px" }} />,
                },
                {
                  color: "#722ed1",
                  children: (
                    <Space direction="vertical" size={4}>
                      <Title
                        level={4}
                        style={{
                          fontSize: "clamp(18px, 2vw, 20px)",
                          margin: 0,
                        }}
                      >
                        2022: Growing Our Community
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "clamp(14px, 1.6vw, 16px)",
                          margin: 0,
                        }}
                      >
                        BlockShare launched publicly and quickly gained a
                        dedicated community of privacy-conscious users who
                        valued our commitment to secure data sharing.
                      </Paragraph>
                    </Space>
                  ),
                  dot: <TeamOutlined style={{ fontSize: "16px" }} />,
                },
                {
                  color: "#fa8c16",
                  children: (
                    <Space direction="vertical" size={4}>
                      <Title
                        level={4}
                        style={{
                          fontSize: "clamp(18px, 2vw, 20px)",
                          margin: 0,
                        }}
                      >
                        2023: Expanding Globally
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "clamp(14px, 1.6vw, 16px)",
                          margin: 0,
                        }}
                      >
                        Today, BlockShare serves users worldwide with a focus on
                        continuous improvement, enhanced security features, and
                        a seamless user experience.
                      </Paragraph>
                    </Space>
                  ),
                  dot: <GlobalOutlined style={{ fontSize: "16px" }} />,
                },
              ]}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Our Team */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ marginBottom: "50px" }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: "40px",
            position: "relative",
            fontSize: "clamp(24px, 3vw, 32px)",
          }}
        >
          <span
            style={{
              position: "relative",
              zIndex: 1,
              background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Meet Our Team
          </span>
          <div
            style={{
              position: "absolute",
              height: "6px",
              width: "60px",
              background: "#1890ff",
              bottom: "-16px",
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "4px",
            }}
          />
        </Title>

        <Row gutter={[16, 32]}>
          {teamMembers.map((member, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card
                  hoverable
                  style={{
                    textAlign: "center",
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "100%",
                  }}
                  cover={
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        padding: "30px 0 60px",
                        position: "relative",
                      }}
                    >
                      <Avatar
                        src={member.avatar}
                        size={window.innerWidth < 576 ? 80 : 100}
                        style={{
                          border: "4px solid white",
                          position: "absolute",
                          bottom: "-40px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  }
                  bodyStyle={{
                    paddingTop: window.innerWidth < 576 ? "50px" : "60px",
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      marginBottom: 4,
                      fontSize: "clamp(16px, 2vw, 20px)",
                    }}
                  >
                    {member.name}
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      marginBottom: 16,
                      fontSize: "clamp(12px, 1.4vw, 14px)",
                    }}
                  >
                    {member.role}
                  </Text>
                  <Paragraph style={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}>
                    {member.description}
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Our Values */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            padding: "40px 20px",
            borderRadius: 12,
            color: "white",
            textAlign: "center",
          }}
        >
          <Title
            level={2}
            style={{
              color: "white",
              marginBottom: 40,
              fontSize: "clamp(24px, 3vw, 32px)",
            }}
          >
            Our Core Values
          </Title>

          <Row gutter={[24, 40]}>
            <Col xs={24} sm={24} md={8}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SafetyOutlined
                  style={{
                    fontSize: "clamp(36px, 5vw, 48px)",
                    marginBottom: 16,
                  }}
                />
                <Title
                  level={3}
                  style={{
                    color: "white",
                    fontSize: "clamp(20px, 2.5vw, 24px)",
                  }}
                >
                  Privacy
                </Title>
                <Paragraph
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 16px)",
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "300px",
                    margin: "0 auto",
                  }}
                >
                  We believe your data belongs to you alone. Our platform is
                  designed to ensure your files remain private and secure.
                </Paragraph>
              </motion.div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TrophyOutlined
                  style={{
                    fontSize: "clamp(36px, 5vw, 48px)",
                    marginBottom: 16,
                  }}
                />
                <Title
                  level={3}
                  style={{
                    color: "white",
                    fontSize: "clamp(20px, 2.5vw, 24px)",
                  }}
                >
                  Excellence
                </Title>
                <Paragraph
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 16px)",
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "300px",
                    margin: "0 auto",
                  }}
                >
                  We strive for technical excellence in everything we build,
                  ensuring reliability, speed, and security.
                </Paragraph>
              </motion.div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TeamOutlined
                  style={{
                    fontSize: "clamp(36px, 5vw, 48px)",
                    marginBottom: 16,
                  }}
                />
                <Title
                  level={3}
                  style={{
                    color: "white",
                    fontSize: "clamp(20px, 2.5vw, 24px)",
                  }}
                >
                  Community
                </Title>
                <Paragraph
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 16px)",
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "300px",
                    margin: "0 auto",
                  }}
                >
                  We&apos;re building more than a product; we&apos;re creating a
                  community of users who value privacy and security.
                </Paragraph>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
