import { configureStore } from "@reduxjs/toolkit";
import { PeerReducer } from "./peer/peerReducer";
import { ConnectionReducer } from "./connection/connectionReducer";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    peer: PeerReducer,
    connection: ConnectionReducer,
  },
});

// Make the store accessible globally
window.store = store;
