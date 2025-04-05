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

          // Add event listener for beforeunload to mark user as offline when closing tab
          const handleBeforeUnload = () => {
            try {
              // Get the current peer ID from localStorage
              const currentPeerId = localStorage.getItem("currentPeerId");
              if (!currentPeerId) {
                console.error("❌ No currentPeerId found in localStorage");
                return;
              }

              console.log(
                "📊 Found currentPeerId in localStorage:",
                currentPeerId
              );
              console.log(
                "📊 Marking user as offline on app unload:",
                currentPeerId
              );

              // Mark the user as offline in the database
              try {
                console.log("📊 Marking user as offline:", currentPeerId);

                // Use sendBeacon for more reliable delivery during tab close
                const data = JSON.stringify({ peerId: currentPeerId });
                const success = navigator.sendBeacon(
                  `${
                    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
                  }/api/user/mark-offline`,
                  data
                );

                if (success) {
                  console.log("✅ Successfully queued offline status update");
                } else {
                  console.error("❌ Failed to queue offline status update");

                  // Fallback to synchronous XMLHttpRequest if sendBeacon fails
                  const xhr = new XMLHttpRequest();
                  xhr.open(
                    "POST",
                    `${
                      import.meta.env.VITE_BACKEND_URL ||
                      "http://localhost:5000"
                    }/api/user/mark-offline`,
                    false
                  ); // false makes it synchronous
                  xhr.setRequestHeader("Content-Type", "application/json");
                  xhr.send(JSON.stringify({ peerId: currentPeerId }));

                  console.log("✅ Used fallback XHR to mark user as offline");
                }
              } catch (error) {
                console.error("❌ Error marking user as offline:", error);
              }
            } catch (error) {
              console.error("❌ Error handling app unload:", error);
            }
          };

          window.addEventListener("beforeunload", handleBeforeUnload);

          // Clean up the event listener when the app unmounts
          return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
          };
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
