import { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Form,
  Input,
  Button,
  Card,
  message,
  Divider,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  UserOutlined,
  CommentOutlined,
  LockOutlined,
  FileOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ContactUs = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSubmit = (values) => {
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      message.success(
        "Thank you for your message! We'll get back to you soon."
      );
      form.resetFields();
      setLoading(false);
    }, 1500);

    // In a real application, you would send this data to your backend
    console.log("Form values:", values);
  };

  // Contact information
  const contactInfo = [
    {
      icon: <MailOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      title: "Email Us",
      content: "support@blockshare.com",
      link: "mailto:support@blockshare.com",
    },
    {
      icon: <PhoneOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      title: "Visit Us",
      content: "123 Innovation Drive, Tech City, CA 94043",
      link: "https://maps.google.com",
    },
  ];

  return (
    <div
      style={{
        padding: "20px 50px 64px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
        backgroundImage:
          "url('https://img.freepik.com/free-vector/network-mesh-wire-digital-technology-background_1017-27428.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.9)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
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
              marginBottom: 60,
              marginTop: 20,
            }}
          >
            <Col xs={24} md={18} lg={16}>
              <Title
                level={1}
                style={{
                  fontSize: "48px",
                  marginBottom: "24px",
                  background:
                    "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Get In Touch
              </Title>
              <Paragraph
                style={{
                  fontSize: "18px",
                  lineHeight: "1.8",
                  marginBottom: "32px",
                }}
              >
                Have questions about BlockShare? We&apos;re here to help! Reach
                out to our team using any of the methods below, and we&apos;ll
                get back to you as soon as possible.
              </Paragraph>
            </Col>
          </Row>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: 60 }}
        >
          <Row gutter={[24, 24]}>
            {contactInfo.map((info, index) => (
              <Col xs={24} sm={8} key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: 12,
                      height: "100%",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>{info.icon}</div>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {info.title}
                    </Title>
                    <a
                      href={info.link}
                      style={{ color: "#1890ff", fontSize: 16 }}
                    >
                      {info.content}
                    </a>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Contact Form and Map */}
        <Row gutter={[32, 32]}>
          {/* Contact Form */}
          <Col xs={24} lg={12}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card
                title={
                  <Title level={3} style={{ margin: 0 }}>
                    Send Us a Message
                  </Title>
                }
                style={{
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Your name"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Your email"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[
                      { required: true, message: "Please enter a subject" },
                    ]}
                  >
                    <Input
                      prefix={<CommentOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Subject of your message"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[
                      { required: true, message: "Please enter your message" },
                    ]}
                  >
                    <TextArea
                      placeholder="Your message"
                      rows={5}
                      style={{ resize: "none" }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      loading={loading}
                      size="large"
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: 8,
                      }}
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>

          {/* Map and Office Info */}
          <Col xs={24} lg={12}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card
                title={
                  <Title level={3} style={{ margin: 0 }}>
                    Our Location
                  </Title>
                }
                style={{
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  height: "100%",
                }}
              >
                {/* Embedded Map */}
                <div style={{ marginBottom: 24 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.639290621064!2d-122.08427492392031!3d37.42199997210171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425dad8f%3A0x29cdf01a44fc687f!2sGoogle%20Building%2040!5e0!3m2!1sen!2sus!4v1689211723530!5m2!1sen!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: 8 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BlockShare Office Location"
                  ></iframe>
                </div>

                <Divider />

                {/* Office Hours */}
                <Title level={4}>Office Hours</Title>
                <Paragraph>
                  <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM
                </Paragraph>
                <Paragraph>
                  <strong>Saturday:</strong> 10:00 AM - 2:00 PM
                </Paragraph>
                <Paragraph>
                  <strong>Sunday:</strong> Closed
                </Paragraph>

                <Divider />

                {/* Support Info */}
                <Title level={4}>Support</Title>
                <Paragraph>
                  For technical support, please email{" "}
                  <a href="mailto:support@blockshare.com">
                    support@blockshare.com
                  </a>{" "}
                  or use our live chat during business hours.
                </Paragraph>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* FAQ Section - Improved Styling */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 60 }}
        >
          <Card
            title={
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    background:
                      "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Frequently Asked Questions
                </Title>
                <div
                  style={{
                    width: "80px",
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                    margin: "16px auto 0",
                    borderRadius: "2px",
                  }}
                />
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <Row gutter={[40, 40]}>
              {[
                {
                  question: "How secure is BlockShare?",
                  answer:
                    "BlockShare uses end-to-end encryption and direct peer-to-peer connections, ensuring your files never pass through our servers. This provides maximum security and privacy for all your data transfers.",
                  icon: (
                    <LockOutlined
                      style={{ color: "#1890ff", fontSize: "24px" }}
                    />
                  ),
                },
                {
                  question: "Is there a file size limit?",
                  answer:
                    "No! Since BlockShare uses direct P2P connections, there are no artificial file size limits. You can share files of any size, limited only by your internet connection speed.",
                  icon: (
                    <FileOutlined
                      style={{ color: "#52c41a", fontSize: "24px" }}
                    />
                  ),
                },
                {
                  question: "Do I need to create an account?",
                  answer:
                    "Yes, a simple account is required to generate your unique peer ID, which is essential for establishing secure connections with other users.",
                  icon: (
                    <UserOutlined
                      style={{ color: "#722ed1", fontSize: "24px" }}
                    />
                  ),
                },
                {
                  question: "How do I share files with someone?",
                  answer:
                    "Simply ask for their peer ID, enter it in the connection field, select your file, and send! The recipient will need to be online to receive the file in real-time.",
                  icon: (
                    <ShareAltOutlined
                      style={{ color: "#fa8c16", fontSize: "24px" }}
                    />
                  ),
                },
              ].map((faq, index) => (
                <Col xs={24} md={12} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      style={{
                        height: "100%",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <div
                          style={{
                            padding: "12px",
                            background: "rgba(24, 144, 255, 0.1)",
                            borderRadius: "8px",
                            marginRight: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {faq.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Title
                            level={4}
                            style={{
                              marginBottom: "12px",
                              color: "#1890ff",
                              fontSize: "18px",
                            }}
                          >
                            {faq.question}
                          </Title>
                          <Paragraph
                            style={{
                              margin: 0,
                              color: "#595959",
                              fontSize: "15px",
                              lineHeight: "1.6",
                            }}
                          >
                            {faq.answer}
                          </Paragraph>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>

            {/* Additional FAQ Link */}
            <div
              style={{
                textAlign: "center",
                marginTop: "32px",
              }}
            >
              <Button
                type="link"
                size="large"
                style={{ fontSize: "16px" }}
                icon={<QuestionCircleOutlined />}
              >
                View More FAQs
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;
