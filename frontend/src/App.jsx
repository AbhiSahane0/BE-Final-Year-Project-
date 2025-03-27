// import DataSharing from "./components/DataSharing";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import DataSharing from "./components/DataSharing";
import OfflineDataSharing from "./components/OfflineDataSharing";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import ProtectedRoute from "./components/ProtectedRoute";
import offlineMessageManager from "./helpers/offlineMessages.jsx";

const { Content } = Layout;

function App() {
  useEffect(() => {
    // Initialize the offline message manager globally
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData && userData.peerId) {
          console.log(
            "Initializing offline message manager with user:",
            userData.username
          );
          offlineMessageManager.init(userData);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    return () => {
      // Clean up on app unmount
      offlineMessageManager.cleanup();
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Content
        style={{
          padding: "64px 0 0",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/DataSharing"
            element={
              <ProtectedRoute>
                <DataSharing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offline-sharing"
            element={
              <ProtectedRoute>
                <OfflineDataSharing />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;
