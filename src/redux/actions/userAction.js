import { SET_USER } from "./types";
import { CLEAR_USER } from "./types";
import { SET_PHOTO_URL } from "./types";

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
