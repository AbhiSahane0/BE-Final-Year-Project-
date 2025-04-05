import { useState, useEffect, useRef } from "react";
import { Button, Card, Input, Typography } from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  // Function to send user query to FastAPI
  const sendQueryToChatbot = async () => {
    if (!userQuery.trim()) return;

    const newChat = { query: userQuery, response: "Thinking..." };
    setChatHistory((prev) => [...prev, newChat]);
    setUserQuery("");

    try {
      const response = await fetch("http://localhost:8000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      const data = await response.json();
      setChatHistory((prev) => {
        const updatedChats = [...prev];
        updatedChats[updatedChats.length - 1].response = data.answer;
        return updatedChats;
      });
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setChatHistory((prev) => {
        const updatedChats = [...prev];
        updatedChats[updatedChats.length - 1].response = "Error: Unable to get response.";
        return updatedChats;
      });
    }
  };

  // Scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <>
      {/* Floating Chatbot Button with Bounce Effect */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 1000,
          backgroundColor: "#1890ff",
          transition: "transform 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => setIsChatOpen(true)}
      />

      {/* Chat Window */}
      {isChatOpen && (
        <Card
          style={{
            position: "fixed",
            bottom: "80px",
            right: "30px",
            width: "400px",
            height: "500px",
            zIndex: 1000,
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {/* Header with Close Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>BlockBot 🤖</Title>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setIsChatOpen(false)}
            />
          </div>

          {/* Scrollable Chat Messages */}
          <div
            ref={chatContainerRef}
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "10px",
              height: "400px",
            }}
          >
            {chatHistory.map((chat, index) => (
              <div key={index} style={{ marginBottom: "15px" }}> {/* Added equal spacing between messages */}
                {/* User Message */}
                <div
                  style={{
                    background: "#1890ff",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "80%",
                    display: "inline-block",
                    textAlign: "right",
                    float: "right",
                    clear: "both",
                    animation: "fadeInUp 0.3s ease forwards",
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <strong>You:</strong> {chat.query}
                </div>
                
                <div style={{ clear: "both", height: "15px" }} /> {/* Equal space between user and bot messages */}

                {/* Bot Message */}
                <div
                  style={{
                    background: "#f0f0f0",
                    color: "#333",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "80%",
                    display: "inline-block",
                    textAlign: "left",
                    float: "left",
                    clear: "both",
                    animation: "fadeInUp 0.3s ease forwards",
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <strong>🤖 :</strong> {chat.response}
                </div>

                <div style={{ clear: "both", height: "15px" }} /> {/* Equal space between bot and user messages */}
              </div>
            ))}
          </div>

          {/* Fixed Input Box with Auto-Expanding TextArea */}
          <div style={{
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid #ddd",
            padding: "8px",
            background: "#fff",
          }}>
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="Type a message..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault(); // Prevents accidental form submission
                sendQueryToChatbot();
              }}
              style={{ flex: 1, marginRight: "8px", resize: "none" }}
            />
            <Button type="primary" onClick={sendQueryToChatbot}>
              Send
            </Button>
          </div>
        </Card>
      )}

      {/* Keyframes for Animations (Injected into Global Style) */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default Chatbot;

