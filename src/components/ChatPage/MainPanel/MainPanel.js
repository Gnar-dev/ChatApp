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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const addMessageListeners = (chatRoomId) => {
    let messagesArray = [];
    const chatRoomMessagesRef = child(dbRef(db, "messages"), chatRoomId);

    onChildAdded(chatRoomMessagesRef, (snapshot) => {
      const message = snapshot.val();
      messagesArray.push(message);
      setMessages([...messagesArray]);
      setMessagesLoading(false);
    });
  };

  const renderMessages = (messages) => {
    return (
      messages.length > 0 &&
      messages?.map((message) => (
        <Message key={message?.timeStamp} message={message} user={user} />
      ))
    );
  };
  const handleSearchMessage = (messageList, searchTerm) => {
    const chatRoomMessages = [...messageList];
    const regex = new RegExp(searchTerm, "gi");
    const searchResults = chatRoomMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    setSearchResults(searchResults);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchLoading(true);
    handleSearchMessage(messages, searchTerm);
  };
  useEffect(() => {
    if (chatRoom) {
      addMessageListeners(chatRoom.id);
    }
  }, [chatRoom]);

  useEffect(() => {
    setSearchLoading(true);
    handleSearchMessage(messages, searchTerm);
  }, [searchTerm]);

  return (
    <StMainPanelContainer>
      <MessageHeader handleSearchChange={handleSearchChange} />
      <StInner>
        {searchTerm ? renderMessages(searchResults) : renderMessages(messages)}
      </StInner>
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
