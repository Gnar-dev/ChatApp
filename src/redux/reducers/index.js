import { combineReducers } from "redux";
import user from "./userReducer";
// import chatRoom from "./chatRoom_reducer";

const rootReducer = combineReducers({
  user,
  // chatRoom,
});

export default rootReducer;
