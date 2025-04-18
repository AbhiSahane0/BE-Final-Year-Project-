import { PeerActionType } from "./peerTypes";

const initialState = {
  id: undefined,
  loading: false,
  started: false,
};

const PeerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PeerActionType.PEER_SESSION_START: {
      const { id } = action;
      return { ...state, id, started: true };
    }
    case PeerActionType.PEER_SESSION_STOP:
      return { ...initialState };
    case PeerActionType.PEER_LOADING: {
      const { loading } = action;
      return { ...state, loading };
    }
    default:
      return state;
  }
};

export { PeerReducer, initialState };
