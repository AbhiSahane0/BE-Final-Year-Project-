// import DataSharing from "./components/DataSharing";
import { Routes, Route } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import DataSharing from "./components/DataSharing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/DataSharing" element={<DataSharing />} />
    </Routes>
  );
}

export default App;
