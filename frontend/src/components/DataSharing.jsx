import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Menu,
  message,
  Row,
  Space,
  Typography,
  Upload,
  notification,
} from "antd";
import { CopyOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { startPeer, stopPeerSession } from "../store/peer/peerActions";
import * as connectionAction from "../store/connection/connectionActions";
import { DataType, PeerConnection } from "../helpers/peer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socketManager from "../helpers/socket";

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

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const DataSharing = () => {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  useEffect(() => {
    // Handle incoming connections
    PeerConnection.onIncomingConnection(() => {
      message.info("New peer connected");
    });

    // Handle connection errors
    PeerConnection.onConnectionError(connection.selectedId, (error) => {
      message.error(`Connection error: ${error.message}`);
      dispatch(connectionAction.removePeer(connection.selectedId));
    });

    // Handle connection closed
    PeerConnection.onConnectionDisconnected(connection.selectedId, () => {
      message.warning("Peer connection closed");
      dispatch(connectionAction.removePeer(connection.selectedId));
    });

    // Handle transfer errors
    PeerConnection.onTransferError((error) => {
      message.error(`Transfer failed: ${error.message}`);
      setFileList([]);
      setSendLoading(false);
    });

    if (userData.peerId) {
      socketManager.connect(userData);
    }

    return () => {
      socketManager.disconnect();
    };
  }, [userData.peerId, connection.selectedId, dispatch]);

  const handleStartSession = () => {
    dispatch(startPeer());
  };

  const handleStopSession = async () => {
    await PeerConnection.closePeerSession();
    dispatch(stopPeerSession());
    socketManager.disconnect();
  };

  const handleConnectOtherPeer = async () => {
    if (!connection.id) {
      message.warning("Please enter ID");
      return;
    }

    try {
      // First check if we already have a P2P connection
      if (PeerConnection.isPeerConnected(connection.id)) {
        message.success("Already connected to peer!");
        return;
      }

      // If no P2P connection, try to establish one
      try {
        await dispatch(connectionAction.connectPeer(connection.id));
        message.success("Connected to peer successfully!");
        return;
      } catch (peerError) {
        console.error("P2P connection failed:", peerError);
      }

      // If P2P connection fails, check socket status
      const response = await axios.get(
        `${BACKEND_URL}/api/user/status/${connection.id}`
      );

      if (response.data.online) {
        // User is online but P2P connection failed
        message.error("Failed to establish P2P connection. Please try again.");
      } else {
        // Show confirmation modal for offline sharing
        notification.info({
          message: "User is Offline",
          description: `This user was last seen ${new Date(
            response.data.lastSeen
          ).toLocaleString()}. Would you like to proceed with offline data sharing?`,
          duration: 0,
          btn: (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notification.destroy();
                  navigate("/offline-sharing", {
                    state: {
                      targetPeerId: connection.id,
                      targetUsername: response.data.username,
                    },
                  });
                }}
              >
                Go to Offline Sharing
              </Button>
              <Button size="small" onClick={() => notification.destroy()}>
                Cancel
              </Button>
            </Space>
          ),
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        message.error("User not found");
      } else {
        message.error("Connection failed: " + error.message);
      }
    }
  };

  const [fileList, setFileList] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a file");
      return;
    }
    if (!connection.selectedId) {
      message.warning("Please select a connection");
      return;
    }

    try {
      setSendLoading(true);
      const file = fileList[0];

      // Check file type before proceeding
      if (!isFileTypeAllowed(file)) {
        throw new Error(
          "File type not supported. Please check the list of supported file types."
        );
      }

      // Show file size
      const fileSizeKB = (file.size / 1024).toFixed(2);
      message.info(`Preparing to send: ${file.name} (${fileSizeKB} KB)`);

      // Set up transfer timeout
      const transferTimeout = setTimeout(() => {
        message.error("Transfer timed out. The peer might be disconnected.");
        setSendLoading(false);
        setFileList([]);
      }, 30000); // 30 seconds timeout

      // Create blob and send
      const blob = new Blob([file], { type: file.type });
      const arrayBuffer = await blob.arrayBuffer();

      await PeerConnection.sendConnection(connection.selectedId, {
        dataType: DataType.FILE,
        file: arrayBuffer,
        fileName: file.name,
        fileType: file.type,
      });

      // Clear timeout as transfer was successful
      clearTimeout(transferTimeout);

      setFileList([]); // Clear file list after successful send
      message.success(`File sent successfully: ${file.name}`);
    } catch (err) {
      // Check if peer is still connected
      const isConnected = await PeerConnection.isPeerConnected(
        connection.selectedId
      );
      if (!isConnected) {
        message.error("Peer disconnected during transfer");
        dispatch(connectionAction.removePeer(connection.selectedId));
      } else {
        message.error(err.message || "Failed to send file");
      }
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Row justify={"center"} align={"top"}>
      <Col xs={24} sm={24} md={20} lg={16} xl={12}>
        <Card>
          <Title level={2} style={{ textAlign: "center" }}>
            P2P File Transfer
          </Title>
          <Card hidden={peer.started}>
            <Button onClick={handleStartSession} loading={peer.loading}>
              Share Data...📩
            </Button>
          </Card>
          <Card hidden={!peer.started}>
            <Space direction="horizontal">
              <div>Your ID : {peer.id}</div>
              <Button
                icon={<CopyOutlined />}
                onClick={async () => {
                  await navigator.clipboard.writeText(peer.id || "");
                  message.info("Copied: " + peer.id);
                }}
              />
              <Button danger onClick={handleStopSession}>
                Stop
              </Button>
            </Space>
          </Card>
          <div hidden={!peer.started}>
            <Card>
              <Space direction="horizontal">
                <Input
                  placeholder={"Search user using ID"}
                  onChange={(e) =>
                    dispatch(
                      connectionAction.changeConnectionInput(e.target.value)
                    )
                  }
                  required={true}
                />
                <Button
                  onClick={handleConnectOtherPeer}
                  loading={connection.loading}
                >
                  Connect
                </Button>
              </Space>
            </Card>

            <Card title="Connection">
              {connection.list.length === 0 ? (
                <div>Waiting for connection ...</div>
              ) : (
                <div>
                  Select a connection
                  <Menu
                    selectedKeys={
                      connection.selectedId ? [connection.selectedId] : []
                    }
                    onSelect={(item) =>
                      dispatch(connectionAction.selectItem(item.key))
                    }
                    items={connection.list.map((e) => getItem(e, e, null))}
                  />
                </div>
              )}
            </Card>
            <Card title="Send File">
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                Supported file types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, MP3,
                WAV, MP4, MKV, ZIP, RAR, 7Z
              </Text>
              <Upload
                fileList={fileList}
                maxCount={1}
                onRemove={() => setFileList([])}
                beforeUpload={(file) => {
                  // Check file size (100MB limit)
                  const maxSize = 100 * 1024 * 1024;
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
              <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={sendLoading}
                style={{ marginTop: 16 }}
              >
                {sendLoading ? "Sending" : "Send"}
              </Button>
            </Card>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DataSharing;
