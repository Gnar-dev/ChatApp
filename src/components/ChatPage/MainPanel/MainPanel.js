import React, { useEffect, useState, useRef } from "react";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import Message from "./Message";
import { styled } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import {
  onChildAdded,
  off,
  getDatabase,
  ref as dbRef,
  onChildRemoved,
  child,
  onChild 
} from "firebase/database";
import Skeleton from '../../../commons/components/Skeleton';
import { setUserPosts } from '../../../redux/actions/chatRoomAction';

const MainPanel = () => {
  const messageEndRef = useRef();
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
  const typingRef = dbRef(db, "typing");
  const [typingUsers, setTypingUsers] = useState([]);
  const [listenerLists, setListenerLists] = useState([]);

  const addMessageListeners = (chatRoomId) => {
    let messagesArray = [];
    const chatRoomMessagesRef = child(dbRef(db, "messages"), chatRoomId);
    onChildAdded(chatRoomMessagesRef, (snapshot) => {
      const message = snapshot.val();
      messagesArray.push(message);
      setMessages([...messagesArray]);
      setMessagesLoading(false);
      userPostsCount(messagesArray);
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

  const userPostsCount = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          image: message.user.image,
          count: 1,
        };
      }
      return acc;
    }, {});
    dispatch(setUserPosts(userPosts));
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

  const removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      off(dbRef(db, `messages/${listener.id}`), listener.event);
    });
  };

  const addTypingListeners = (chatRoomId) => {
    let typingUsers = [];

    onChildAdded(child(typingRef, chatRoomId), (DataSnapshot) => {
      if (DataSnapshot.key !== user.uid) {
        typingUsers = typingUsers.concat({
          id: DataSnapshot.key,
          name: DataSnapshot.val(),
        });
        setTypingUsers(typingUsers);
      }
    });

    addToListenerLists(chatRoomId, typingRef, "child_added");

    onChildRemoved(child(typingRef, chatRoomId), (DataSnapshot) => {
      const index = typingUsers.findIndex(
        (user) => user.id === DataSnapshot.key
      );
      if (index !== -1) {
        typingUsers = typingUsers.filter(
          (user) => user.id !== DataSnapshot.key
        );
        setTypingUsers(typingUsers);
      }
    });

    addToListenerLists(chatRoomId, typingRef, "child_removed");
  };

  const addToListenerLists = (id, ref, event) => {
    const index = listenerLists.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      setListenerLists((prevListenerLists) => [
        ...prevListenerLists,
        newListener,
      ]);
    }
  };

  const renderTypingUsers = (typingUsers) => {
    return (
      typingUsers.length > 0 &&
      typingUsers.map((user) => (
        <span>{user.name.userUid}님이 채팅을 입력하고 있습니다...</span>
      ))
    );
  };

  const renderMessageSkeleton = (loading) => {
    return (
      loading && (
        <>
          {[...Array(10)].map((v, i) => (
            <Skeleton key={i} />
          ))}
        </>
      )
    );
  };

  useEffect(() => {
    if (chatRoom) {
      addMessageListeners(chatRoom.id);
      addTypingListeners(chatRoom.id);
    }
    return () => {
      off(messagesRef);
      removeListeners(listenerLists);
    };
    //eslint-disable-next-line
  }, [chatRoom]);

  useEffect(() => {
    setSearchLoading(true);
    handleSearchMessage(messages, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <StMainPanelContainer>
      <MessageHeader handleSearchChange={handleSearchChange} />
      <StInner>
        {renderMessageSkeleton(messagesLoading)}
        {searchTerm ? renderMessages(searchResults) : renderMessages(messages)}
        {renderTypingUsers(typingUsers)}
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
