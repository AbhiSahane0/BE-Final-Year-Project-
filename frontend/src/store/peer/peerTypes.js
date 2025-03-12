const PeerActionType = {
  PEER_SESSION_START: "PEER_SESSION_START",
  PEER_SESSION_STOP: "PEER_SESSION_STOP",
  PEER_LOADING: "PEER_LOADING",
};

const initialPeerState = {
  id: undefined,
  loading: false,
  started: false,
};

export { PeerActionType, initialPeerState };
