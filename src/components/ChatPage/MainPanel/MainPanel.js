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
  remove,
} from "firebase/database";
import Skeleton from "../../../commons/components/Skeleton";
import { setUserPosts } from "../../../redux/actions/chatRoomAction";

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
    const typingUsersRef = child(typingRef, chatRoomId);

    onChildAdded(typingUsersRef, (snapshot) => {
      if (snapshot.key !== user.uid) {
        const newUser = {
          id: snapshot.key,
          displayName: snapshot.val(),
        };
        // 중복 체크
        const isUserExist = typingUsers.some((user) => user.id === newUser.id);
        if (!isUserExist) {
          setTypingUsers((prevTypingUsers) => [...prevTypingUsers, newUser]);
        }
      }
    });

    addToListenerLists(chatRoomId, typingRef, "child_added");

    onChildRemoved(typingUsersRef, (snapshot) => {
      const removedUserId = snapshot.key;
      setTypingUsers((prevTypingUsers) =>
        prevTypingUsers.filter((user) => user.id !== removedUserId)
      );
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
    if (typingUsers.length > 1) {
      const otherUsersCount = typingUsers.length - 1;
      return (
        <>
          <StTypingUserInfo>
            {typingUsers[0].displayName}님 외 {otherUsersCount}명이 채팅을
            입력하고 있습니다...
          </StTypingUserInfo>
        </>
      );
    } else if (typingUsers.length === 1) {
      return (
        <StTypingUserInfo>
          {typingUsers[0].displayName}님이 채팅을 입력하고 있습니다...
        </StTypingUserInfo>
      );
    } else {
      return null;
    }
  };

  const renderMessageSkeleton = (loading) => {
    return (
      loading && (
        <>
          {[...Array(5)].map((v, i) => (
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
      remove(typingRef);
      dispatch(setUserPosts(""));
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
  });

  return (
    <StMainPanelContainer>
      <MessageHeader handleSearchChange={handleSearchChange} />
      <StInner>
        {renderMessages(messages).length > 0
          ? renderMessageSkeleton(messagesLoading)
          : null}
        {searchTerm ? renderMessages(searchResults) : renderMessages(messages)}
        {renderTypingUsers(typingUsers)}
        <div ref={messageEndRef} />
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
  position: relative;
  overflow: auto;
`;

const StTypingUserInfo = styled.div`
  margin-top: 1rem;
  color: #ccc;
  font-weight: bold;
`;
