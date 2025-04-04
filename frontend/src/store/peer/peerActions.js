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

export const stopPeerSession = () => ({
  type: PeerActionType.PEER_SESSION_STOP,
});

export const setLoading = (loading) => ({
  type: PeerActionType.PEER_LOADING,
  loading,
});

export const startPeer = (email) => {
  return async function (dispatch) {
    dispatch(setLoading(true));

    try {
      let storedPeerId = localStorage.getItem("peerId");

      if (!storedPeerId) {
        const response = await axios.post("http://localhost:5000/verify-user", {
          email,
        });
        storedPeerId = response.data.peerId;

        if (storedPeerId) {
          localStorage.setItem("peerId", storedPeerId);
          console.log("Fetched and stored Peer ID:", storedPeerId);
        } else {
          console.error("Error: Peer ID not found in DB");
          return;
        }
      }

      const id = await PeerConnection.startPeerSession(storedPeerId);

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
