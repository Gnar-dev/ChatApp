import React, { useEffect, useState } from "react";
import { FaRegSmileBeam } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoomAction";
import {
  child,
  getDatabase,
  ref,
  onChildAdded,
  onChildRemoved,
  off,
} from "firebase/database";
import styled from "styled-components";

const Favorited = ({ active, onClick }) => {
  const [favoritedChatRooms, setFavoritedChatRooms] = useState([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState("");
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const userRef = ref(getDatabase(), "users");

  useEffect(() => {
    if (user) {
      addListeners(user.uid);
    }

    return () => {
      if (user) {
        removeListener(user.uid);
      }
    };
    //eslint-disable-next-line
  }, [user]);

  const removeListener = (userId) => {
    off(child(userRef, `${userId}/favorited`));
  };

  const addListeners = (userId) => {
    onChildAdded(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      const favoritedChatRoom = { id: DataSnapshot.key, ...DataSnapshot.val() };
      setFavoritedChatRooms((prevChatRooms) => [
        ...prevChatRooms,
        favoritedChatRoom,
      ]);
    });

    onChildRemoved(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      const chatRoomToRemove = { id: DataSnapshot.key, ...DataSnapshot.val() };
      setFavoritedChatRooms((prevChatRooms) =>
        prevChatRooms.filter((chatRoom) => chatRoom.id !== chatRoomToRemove.id)
      );
    });
  };

  const changeChatRoom = (room) => {
    dispatch(setCurrentChatRoom(room));
    dispatch(setPrivateChatRoom(false));
    setActiveChatRoomId(room.id);
  };

  const renderFavoritedChatRooms = (favoritedChatRooms) => {
    if (!favoritedChatRooms) {
      return null;
    }
    return (
      favoritedChatRooms?.length > 0 &&
      favoritedChatRooms?.map((chatRoom) => (
        <StFavoritedMessageUserLi
          key={chatRoom.id}
          onClick={(e) => {
            e.stopPropagation();
            onClick(chatRoom);
            changeChatRoom(chatRoom);
          }}
          active={active && chatRoom.id === activeChatRoomId ? true : undefined}
        >
          # {chatRoom?.roomName}
        </StFavoritedMessageUserLi>
      ))
    );
  };
  return (
    <StFavoritedMessageContainer>
      <StFavoritedMessageTitle>
        <FaRegSmileBeam style={{ marginRight: 10 }} />
        즐겨찾기 ({favoritedChatRooms.length})
      </StFavoritedMessageTitle>
      <StFavoritedMessageUl>
        {" "}
        {renderFavoritedChatRooms(favoritedChatRooms)}
      </StFavoritedMessageUl>
    </StFavoritedMessageContainer>
  );
};

export default Favorited;

const StFavoritedMessageContainer = styled.div``;

const StFavoritedMessageTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StFavoritedMessageUl = styled.ul`
  list-style: none;
  padding: 0;
  padding-left: 10px;
`;

const StFavoritedMessageUserLi = styled.li`
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
