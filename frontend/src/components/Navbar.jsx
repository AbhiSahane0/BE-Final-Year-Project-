import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Typography, Layout, Button, Drawer } from "antd";
import {
  BlockOutlined,
  MenuOutlined,
  CloseOutlined,
  HomeOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  const menuItems = [
    { key: "/", label: "Home", icon: <HomeOutlined /> },
    { key: "/DataSharing", label: "Share Data", icon: <ShareAltOutlined /> },
    { key: "/about", label: "About", icon: <InfoCircleOutlined /> },
    { key: "/contact", label: "Contact", icon: <MailOutlined /> },
  ];

  const handleMenuClick = () => {
    if (isMobile) {
      setVisible(false);
    }
  };

  return (
    <Header
      style={{
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: isMobile ? "0 20px" : "0 50px",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <BlockOutlined
          style={{
            fontSize: isMobile ? "20px" : "24px",
            color: "#1890ff",
            marginRight: "8px",
          }}
        />
        <Title
          level={isMobile ? 4 : 3}
          style={{
            margin: 0,
            color: "#1890ff",
            whiteSpace: "nowrap",
          }}
        >
          BlockShare
        </Title>
      </Link>

      {/* Desktop Menu */}
      {!isMobile && (
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{
            border: "none",
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "transparent",
          }}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: "20px", color: "#1890ff" }} />}
          onClick={showDrawer}
          style={{ border: "none" }}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <BlockOutlined
                style={{
                  fontSize: "20px",
                  color: "#1890ff",
                  marginRight: "8px",
                }}
              />
              <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                BlockShare
              </span>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeDrawer}
              style={{ border: "none" }}
            />
          </div>
        }
        placement="right"
        closable={false}
        onClose={closeDrawer}
        open={visible}
        width={250}
        bodyStyle={{ padding: 0 }}
        headerStyle={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{ border: "none" }}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{ height: "50px", display: "flex", alignItems: "center" }}
            >
              <Link
                to={item.key}
                onClick={handleMenuClick}
                style={{ fontSize: "16px" }}
              >
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
    </Header>
  );
};

export default Navbar;
