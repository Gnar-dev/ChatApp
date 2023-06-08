import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaRegSmileWink } from "react-icons/fa";
import { getDatabase, ref as dbRef, onChildAdded } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoomAction";
const DirectMessages = ({ active, onClick }) => {
  const db = getDatabase();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const [activeChatRoom, setActiveChatRoom] = useState("");
  useEffect(() => {
    if (currentUser) {
      const usersRef = dbRef(db, "users");
      addUsersListeners(usersRef, currentUser.uid);
    }
  }, [currentUser, db]);
  const addUsersListeners = (usersRef, currentUserId) => {
    const usersArray = [];

    onChildAdded(usersRef, (DataSnapshot) => {
      if (currentUserId !== DataSnapshot.key) {
        const user = DataSnapshot.val();
        user.uid = DataSnapshot.key;
        user.status = "offline";
        usersArray.push(user);
      }
    });
    setUsers(usersArray);
  };

  const getChatRoomId = (userId) => {
    const currentUserId = currentUser.uid;

    return userId > currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  const changeChatRoom = (user) => {
    const chatRoomId = getChatRoomId(user.uid);
    const chatRoomData = {
      id: chatRoomId,
      name: user.name,
    };

    dispatch(setCurrentChatRoom(chatRoomData));
    dispatch(setPrivateChatRoom(true));
    setActiveChatRoom(user.uid);
  };

  const renderDirectMessages = (users) => {
    return (
      users.length > 0 &&
      users?.map((user) => (
        <StDirectMessageUserLi
          key={user.uid}
          active={active && user?.uid === activeChatRoom ? true : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onClick(user);
            changeChatRoom(user);
          }}
        >
          # {user.name}
        </StDirectMessageUserLi>
      ))
    );
  };

  return (
    <StDirectMessageContainer>
      <StDirectMessageTitle>
        <FaRegSmileWink style={{ marginRight: 10 }} />
        DIRECT MESSAGES ({users.length})
      </StDirectMessageTitle>
      <StDirectMessageUl> {renderDirectMessages(users)}</StDirectMessageUl>
    </StDirectMessageContainer>
  );
};

export default DirectMessages;

const StDirectMessageContainer = styled.div``;

const StDirectMessageTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StDirectMessageUl = styled.ul`
  list-style: none;
  padding: 0;
  padding-left: 10px;
`;

const StDirectMessageUserLi = styled.li`
  cursor: pointer;
  padding: 5px;
  transition: all 0.9s;
  font-size: 14px;
  font-weight: 700;
  background-color: ${(props) => (props.active ? "black" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  &:hover {
    color: white;
    box-shadow: 376px 0 0 0 #000 inset;
  }
`;
