import { ConnectionActionType } from "./connectionTypes";
import { PeerConnection, DataType } from "../../helpers/peer";
import { handleFileDownload } from "../../helpers/fileHandler.jsx";

export const changeConnectionInput = (id) => ({
  type: ConnectionActionType.CONNECTION_INPUT_CHANGE,
  id,
});

export const setLoading = (loading) => ({
  type: ConnectionActionType.CONNECTION_LOADING,
  loading,
});

export const addConnectionList = (id) => ({
  type: ConnectionActionType.CONNECTION_LIST_ADD,
  id,
});

export const removeConnectionList = (id) => ({
  type: ConnectionActionType.CONNECTION_LIST_REMOVE,
  id,
});

export const selectItem = (id) => ({
  type: ConnectionActionType.CONNECTION_ITEM_SELECT,
  id,
});

export const connectPeer = (id) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      await PeerConnection.connectPeer(id);

      PeerConnection.onConnectionDisconnected(id, () => {
        dispatch(removeConnectionList(id));
      });

      PeerConnection.onConnectionReceiveData(id, (receivedData) => {
        if (receivedData.dataType === DataType.FILE) {
          handleFileDownload(receivedData);
        }
      });

      dispatch(addConnectionList(id));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      // Pass the error up to be handled by the component
      throw err;
    }
  };
};
