import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

function OfflineDataSharing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { targetPeerId, targetUsername } = location.state || {};

  if (!targetPeerId) {
    return (
      <Card style={{ maxWidth: 600, margin: "50px auto" }}>
        <Title level={3}>Invalid Access</Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          No peer information provided. Please select a peer from the Data
          Sharing page.
        </Text>
        <Button type="primary" onClick={() => navigate("/DataSharing")}>
          Return to Data Sharing
        </Button>
      </Card>
    );
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      // Implement your offline file upload logic here
      // This could involve storing the file in a database or server
      message.success("File uploaded for offline sharing");
      setFileList([]);
    } catch (error) {
      message.error("Upload failed: " + error.message);
    }
    setUploading(false);
  };

  return (
    <Card style={{ maxWidth: 600, margin: "50px auto" }}>
      <Title level={2}>Offline Data Sharing</Title>
      <Text>
        Sharing files with: {targetUsername || "Unknown User"} (Offline)
      </Text>
      <Text type="secondary" style={{ display: "block", margin: "16px 0" }}>
        Peer ID: {targetPeerId}
      </Text>

      <Upload
        fileList={fileList}
        maxCount={1}
        onRemove={() => setFileList([])}
        beforeUpload={(file) => {
          setFileList([file]);
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading..." : "Upload for Offline Sharing"}
      </Button>

      <Button
        onClick={() => navigate("/DataSharing")}
        style={{ marginTop: 16, marginLeft: 8 }}
      >
        Back to Data Sharing
      </Button>
    </Card>
  );
}

export default OfflineDataSharing;
