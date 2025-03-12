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

const { Title } = Typography;

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

  useEffect(() => {
    PeerConnection.onIncomingConnection((conn) => {
      conn.on("data", handleReceiveFile);
    });
  }, []);

  const handleReceiveFile = (receivedData) => {
    console.log("file recived called");
    if (receivedData.dataType === DataType.FILE) {
      notification.open({
        message: "File Received",
        description: `You have received a file: ${receivedData.fileName}. Would you like to download it?`,
        btn: (
          <Button
            type="primary"
            onClick={() => {
              const url = URL.createObjectURL(receivedData.file);
              const a = document.createElement("a");
              a.href = url;
              a.download = receivedData.fileName;
              a.click();
              URL.revokeObjectURL(url);
              notification.close();
            }}
          >
            Download
          </Button>
        ),
      });
    }
  };

  const handleStartSession = () => {
    dispatch(startPeer());
  };

  const handleStopSession = async () => {
    await PeerConnection.closePeerSession();
    dispatch(stopPeerSession());
  };

  const handleConnectOtherPeer = () => {
    if (connection.id) {
      dispatch(connectionAction.connectPeer(connection.id));
    } else {
      message.warning("Please enter ID");
      alert("Please enter ID");
    }
  };

  const [fileList, setFileList] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0 || !connection.selectedId) {
      message.warning("Please select both a file and a connection");
      return;
    }

    try {
      setSendLoading(true);
      const file = fileList[0];
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      await PeerConnection.sendConnection(connection.selectedId, {
        dataType: DataType.FILE,
        file: arrayBuffer,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream'
      });
      
      setSendLoading(false);
      message.success("File sent successfully");
    } catch (err) {
      setSendLoading(false);
      console.error("File upload error:", err);
      message.error("Failed to send file: " + err.message);
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
