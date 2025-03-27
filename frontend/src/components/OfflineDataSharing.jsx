import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, Upload, Button, message, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";

const { Title, Text } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Allowed file types and their corresponding MIME types
const ALLOWED_FILE_TYPES = {
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  // Video
  mp4: "video/mp4",
  mkv: "video/x-matroska",
  // Archives
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed",
};

// Helper function to check file type
const isFileTypeAllowed = (file) => {
  const fileType = file.type;
  const fileExtension = file.name.split(".").pop().toLowerCase();

  // Check if the file extension is in our allowed list
  if (!ALLOWED_FILE_TYPES[fileExtension]) {
    return false;
  }

  // Verify that the MIME type matches what we expect for this extension
  if (ALLOWED_FILE_TYPES[fileExtension] !== fileType) {
    return false;
  }

  return true;
};

function OfflineDataSharing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { targetPeerId, targetUsername } = location.state || {};
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

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
    setUploadProgress(0);

    try {
      const file = fileList[0];

      // Additional file type validation before upload
      if (!isFileTypeAllowed(file)) {
        throw new Error(
          "File type not allowed. Please check the supported file types."
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderPeerId", userData.peerId);
      formData.append("senderUsername", userData.username);
      formData.append("receiverPeerId", targetPeerId);

      await axios.post(`${BACKEND_URL}/api/share/offline`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      message.success(`File queued for delivery to ${targetUsername}`);
      setFileList([]);
      setUploadProgress(0);

      // Show detailed success message
      message.info({
        content: `File will be delivered when ${targetUsername} comes online`,
        duration: 5,
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        message.error(
          "Authentication error. Please check your API key configuration."
        );
      } else if (error.response?.status === 500) {
        const errorMessage =
          error.response?.data?.error || "Server error occurred";
        message.error(`Upload failed: ${errorMessage}`);
        console.error("Server error details:", error.response?.data);
      } else if (error.message === "File type not allowed") {
        message.error(error.message);
      } else {
        message.error("Failed to upload file. Please try again.");
      }
    } finally {
      setUploading(false);
    }
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

      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Supported file types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, MP3, WAV, MP4,
        MKV, ZIP, RAR, 7Z
      </Text>

      <Upload
        fileList={fileList}
        maxCount={1}
        onRemove={() => {
          setFileList([]);
          setUploadProgress(0);
        }}
        beforeUpload={(file) => {
          // Check file size
          const maxSize = 100 * 1024 * 1024; // 100MB
          if (file.size > maxSize) {
            message.error("File size must be less than 100MB");
            return false;
          }

          // Check file type
          if (!isFileTypeAllowed(file)) {
            message.error(
              "File type not supported. Please check the list of supported file types."
            );
            return false;
          }

          setFileList([file]);
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress
          percent={uploadProgress}
          status="active"
          style={{ marginTop: 16 }}
        />
      )}

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0 || uploading}
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
