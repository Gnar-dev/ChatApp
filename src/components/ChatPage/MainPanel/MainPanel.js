import React, { useEffect, useState } from "react";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import Message from "./Message";
import { styled } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import {
  onChildAdded,
  onValue,
  off,
  getDatabase,
  ref as dbRef,
  push,
  update,
  child,
} from "firebase/database";

const MainPanel = () => {
  const user = useSelector((state) => state.user.currentUser);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const dispatch = useDispatch();
  const db = getDatabase();
  const [messages, setMessages] = useState([]);
  const [messagesRef, setMessagesRef] = useState(dbRef(db, "messages"));
  const [messagesLoading, setMessagesLoading] = useState(true);

  const addMessageListeners = (chatRoomId) => {
    let messagesArray = [];
    const chatRoomMessagesRef = child(dbRef(db, "messages"), chatRoomId);

    onChildAdded(chatRoomMessagesRef, (snapshot) => {
      const message = snapshot.val();
      messagesArray.push(message);
      setMessagesRef([...messagesArray]);
      setMessagesLoading(false);
    });
  };

  const renderMessages = (messages) => {
    messages.length > 0 &&
      messages.map((message) => {
        <Message key={message.timestamp} message={message} user={user} />;
      });
  };
  useEffect(() => {
    if (chatRoom) {
      addMessageListeners(chatRoom.id);
    }
  }, [chatRoom]);

  return (
    <StMainPanelContainer>
      <MessageHeader />
      <StInner>{renderMessages}</StInner>
      <MessageForm />
    </StMainPanelContainer>
  );
};

export default MainPanel;

const StMainPanelContainer = styled.div`
  padding: 2rem;
  position: relative;
  height: 100%;
`;

const StInner = styled.div`
  width: 100%;
  height: 450px;
  border: 0.2rem solid black;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
`;
