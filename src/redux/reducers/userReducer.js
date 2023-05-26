import { SET_USER } from "../actions/types";
import { CLEAR_USER } from "../actions/types";
import { SET_PHOTO_URL } from "../actions/types";
import { ADD_CHAT_ROOM } from "../actions/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
};

export default function userReducer(state = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
      };
    case CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false,
      };
    case SET_PHOTO_URL:
      return {
        ...state,
        currentUser: { ...state.currentUser, photoURL: action.payload },
        isLoading: false,
      };
    case ADD_CHAT_ROOM:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          roomName: action.payload,
          roomDes: action.payload.room,
        },
        isLoading: false,
      };
    default:
      return state;
  }
}
