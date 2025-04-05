import { Navigate } from "react-router-dom";
import { message } from "antd";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const isRegistered = localStorage.getItem("registered") === "true";

  if (!isRegistered) {
    message.error("Please register or login first");
    return <Navigate to="/register" replace />;
  }

  return children;
};

// Add PropTypes validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
