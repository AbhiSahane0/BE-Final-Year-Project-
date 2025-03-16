// import DataSharing from "./components/DataSharing";
import { Routes, Route } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import DataSharing from "./components/DataSharing";
import OfflineDataSharing from "./components/OfflineDataSharing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/DataSharing" element={<DataSharing />} />
      <Route path="/offline-sharing" element={<OfflineDataSharing />} />
    </Routes>
  );
}

export default App;
