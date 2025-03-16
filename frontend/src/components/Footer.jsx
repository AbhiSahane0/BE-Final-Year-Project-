import { Layout, Typography, Space } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  InstagramOutlined,
  HeartFilled,
} from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter
      style={{
        textAlign: "center",
        background: "#f0f2f5",
        padding: "24px 50px",
        marginTop: "auto",
      }}
    >
      <Space direction="vertical" size={16}>
        <Space size={24}>
          <Link href="https://twitter.com" target="_blank">
            <TwitterOutlined style={{ fontSize: "24px", color: "#1DA1F2" }} />
          </Link>
          <Link href="https://instagram.com" target="_blank">
            <InstagramOutlined style={{ fontSize: "24px", color: "#E4405F" }} />
          </Link>
          <Link href="https://github.com" target="_blank">
            <GithubOutlined style={{ fontSize: "24px", color: "#24292F" }} />
          </Link>
        </Space>
        <Text>
          Made with <HeartFilled style={{ color: "#ff0000" }} /> by BlockShare
          Team
        </Text>
      </Space>
    </AntFooter>
  );
};

export default Footer;
