export const ConnectionActionType = {
  CONNECTION_INPUT_CHANGE: 'CONNECTION_INPUT_CHANGE',
  CONNECTION_LOADING: 'CONNECTION_LOADING',
  CONNECTION_LIST_ADD: 'CONNECTION_LIST_ADD',
  CONNECTION_LIST_REMOVE: 'CONNECTION_LIST_REMOVE',
  CONNECTION_ITEM_SELECT: 'CONNECTION_ITEM_SELECT'
};

const initialState = {
  id: undefined,
  loading: false,
  list: [],
  selectedId: undefined,
};

export { initialState };
