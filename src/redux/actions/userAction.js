import { SET_USER } from "./types";
import { CLEAR_USER } from "./types";
import { SET_PHOTO_URL } from "./types";
import { ADD_CHAT_ROOM } from "./types";
export function setUser(user) {
  return {
    type: SET_USER,
    payload: user,
  };
}

export function clearUser() {
  return {
    type: CLEAR_USER,
  };
}

export function setPhotoUrl(photoURL) {
  return {
    type: SET_PHOTO_URL,
    payload: photoURL,
  };
}
export function addChatRoom(roomName, roomDes, user) {
  return {
    type: ADD_CHAT_ROOM,
    payload: { roomName, roomDes, user },
  };
}
