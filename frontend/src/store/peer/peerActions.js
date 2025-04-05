import { PeerActionType } from "./peerTypes";
import { PeerConnection, DataType } from "../../helpers/peer";
import { message } from "antd";
import axios from "axios";
import {
  addConnectionList,
  removeConnectionList,
} from "../connection/connectionActions";
import { handleFileDownload } from "../../helpers/fileHandler.jsx";

export const startPeerSession = (id) => ({
  type: PeerActionType.PEER_SESSION_START,
  id,
});

export const stopPeerSession = () => {
  return async function (dispatch) {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      // Mark user as offline in the database
      if (userData && userData.peerId) {
        try {
          const BACKEND_URL =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
          console.log("📊 Marking user as offline:", userData.peerId);

          await axios.post(`${BACKEND_URL}/api/user/mark-offline`, {
            peerId: userData.peerId,
          });
          console.log("✅ Successfully marked user as offline");
        } catch (error) {
          console.error("❌ Error marking user as offline:", error);
        }
      }

      // Dispatch the stop session action
      dispatch({ type: PeerActionType.PEER_SESSION_STOP });
    } catch (error) {
      console.error("Error stopping peer session:", error);
    }
  };
};

export const setLoading = (loading) => ({
  type: PeerActionType.PEER_LOADING,
  loading,
});

export const startPeer = () => {
  return async function (dispatch) {
    dispatch(setLoading(true));

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (!userData.peerId) {
        console.error("Error: No peer ID found in userData");
        return;
      }

      const id = await PeerConnection.startPeerSession(userData.peerId);

      // Update OnlineUsers database when peer connection is started
      if (userData && userData.peerId && userData.username && userData.email) {
        try {
          const BACKEND_URL =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
          await axios.post(`${BACKEND_URL}/api/user/update-status`, {
            peerId: userData.peerId,
            username: userData.username,
            email: userData.email,
          });
          console.log(
            "Updated online status in database when starting peer connection"
          );
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      }

      PeerConnection.onIncomingConnection((conn) => {
        const peerId = conn.peer;
        message.info("Incoming connection: " + peerId);
        dispatch(addConnectionList(peerId));

        PeerConnection.onConnectionDisconnected(peerId, () => {
          message.info("Connection closed: " + peerId);
          dispatch(removeConnectionList(peerId));
        });

        PeerConnection.onConnectionReceiveData(peerId, (receivedData) => {
          if (receivedData.dataType === DataType.FILE) {
            handleFileDownload(receivedData);
          }
        });
      });

      dispatch(startPeerSession(id));
      dispatch(setLoading(false));
    } catch (err) {
      console.error("Error starting Peer:", err);
      dispatch(setLoading(false));
    }
  };
};
