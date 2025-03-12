import { ConnectionActionType } from "./connectionTypes";

const initialState = {
  id: "",
  loading: false,
  list: [],
  selectedId: null,
};

export const ConnectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ConnectionActionType.CONNECTION_INPUT_CHANGE:
      return {
        ...state,
        id: action.id,
      };
    case ConnectionActionType.CONNECTION_LOADING:
      return {
        ...state,
        loading: action.loading,
      };
    case ConnectionActionType.CONNECTION_LIST_ADD:
      if (state.list.includes(action.id)) {
        return state;
      }
      return {
        ...state,
        list: [...state.list, action.id],
      };
    case ConnectionActionType.CONNECTION_LIST_REMOVE:
      return {
        ...state,
        list: state.list.filter((id) => id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case ConnectionActionType.CONNECTION_ITEM_SELECT:
      return {
        ...state,
        selectedId: action.id,
      };
    default:
      return state;
  }
};
