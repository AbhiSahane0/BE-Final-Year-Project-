// import DataSharing from "./components/DataSharing";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import DataSharing from "./components/DataSharing";
import OfflineDataSharing from "./components/OfflineDataSharing";

const { Content } = Layout;

function App() {
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
          <Route path="/DataSharing" element={<DataSharing />} />
          <Route path="/offline-sharing" element={<OfflineDataSharing />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;
