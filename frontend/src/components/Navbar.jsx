import { Link, useLocation } from "react-router-dom";
import { Menu, Typography, Layout } from "antd";
import { BlockOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { key: "/", label: "Home" },
    { key: "/DataSharing", label: "Share Data" },
    { key: "/about", label: "About" },
    { key: "/contact", label: "Contact" },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "0 50px",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <BlockOutlined
          style={{ fontSize: "24px", color: "#1890ff", marginRight: "8px" }}
        />
        <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
          BlockShare
        </Title>
      </Link>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ border: "none", flex: 1, justifyContent: "flex-end" }}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.key}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Header>
  );
};

export default Navbar;
