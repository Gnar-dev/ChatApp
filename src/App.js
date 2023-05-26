import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import ChatPage from "./components/ChatPage/ChatPage.js";
import LoginPage from "./components/LoginPage/LoginPage.js";
import RegisterPage from "./components/RegisterPage/RegisterPage.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser,clearUser } from "./redux/actions/userAction.js";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        dispatch(setUser(user));
      } else {
        navigate("/login");
        dispatch(clearUser(user));
      }
    });
  }, []);

  if (isLoading) {
    return <div>...loading</div>;
  } else {
    return (
      <Routes>
        <Route path="/" element={<ChatPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
      </Routes>
    );
  }
}

export default App;
