import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import styled from "styled-components";
import { FaRegSmileWink } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
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
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoomAction";
import { auth } from "../../../firebase";
import { setUserPosts } from "../../../redux/actions/chatRoomAction";

const ChatRooms = ({ active, onClick }) => {
  //리덕스 이용

  const user = useSelector((state) => state.user.currentUser);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const userPosts = useSelector((state) => state.chatRoom.userPosts);
  const dispatch = useDispatch();

  //state 관리
  const [show, setShow] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDes, setRoomDes] = useState("");
  //eslint-disable-next-line
  const [chatRoomsRef, setChatRoomsRef] = useState(
    dbRef(getDatabase(), "chatRooms")
  );
  // const [messagesRef, setMessagesRef] = useState(
  //   dbRef(getDatabase(), "messages")
  // );
  const messagesRef = dbRef(getDatabase(), "messages");
  const [chatRooms, setChatRooms] = useState([]);
  //eslint-disable-next-line
  const [firstLoad, setFirstLoad] = useState(true);
  const [activeChatRoomId, setActiveChatRoomId] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    initializeNotifications();
    addChatRoomsListeners();

    return () => {
      off(chatRoomsRef);
      chatRooms.forEach((chatRoom) => {
        off(child(messagesRef, chatRoom.id));
      });
    };
    //eslint-disable-next-line
  }, []);
  useEffect(() => {
    loadLastChatRoom();
    //eslint-disable-next-line
  }, [chatRooms]);

  const initializeNotifications = () => {
    const initialNotifications = chatRooms.map((room) => ({
      id: room.id,
      total: 0,
      lastKnownTotal: 0,
      count: 0,
    }));
    setNotifications(initialNotifications);
  };

  const handleCreateChatRoom = (e) => {
    e.preventDefault();
    if (setRoomName && setRoomDes) {
      addChatRoomFunction();
      resetUserPosts();
    }
  };

  const addChatRoomFunction = async () => {
    const key = push(chatRoomsRef).key;
    const newChatRoom = {
      id: key,
      roomName,
      roomDes,
      createdBy: {
        name: user.displayName,
        image: user.photoURL,
      },
    };
    try {
      await update(child(chatRoomsRef, key), newChatRoom);
      setRoomName("");
      setRoomDes("");
      setShow(false);
      addNotificationListener(key);
    } catch (error) {
      alert(error);
    }
  };

  const resetUserPosts = () => {
    dispatch(setUserPosts(""));
  };
  const addChatRoomsListeners = () => {
    let chatRoomsArray = [];

    onChildAdded(chatRoomsRef, (dataSnapshot) => {
      chatRoomsArray.push(dataSnapshot.val());
      setChatRooms(chatRoomsArray);
      addNotificationListener(dataSnapshot.key);
    });

    chatRoomsArray.forEach((chatRoom) => {
      addNotificationListener(chatRoom.id);
    });
  };

  const addNotificationListener = (chatRoomId) => {
    const chatRoomMessagesRef = child(messagesRef, chatRoomId);
    onValue(chatRoomMessagesRef, (dataSnapshot) => {
      if (chatRoom) {
        handleNotification(chatRoomId, chatRoom.id, dataSnapshot);
      }
    });
  };
  const handleNotification = (chatRoomId, currentChatRoomId, dataSnapshot) => {
    if (!chatRoom) {
      return;
    }

    setNotifications((prevNotifications) => {
      return prevNotifications.map((notification) => {
        if (notification.id === chatRoomId) {
          let count = 0;
          if (chatRoomId !== currentChatRoomId) {
            const lastTotal = notification.lastKnownTotal || 0;
            count = dataSnapshot.size - lastTotal;
          }
          const updatedNotification = {
            ...notification,
            total: dataSnapshot.size,
            count: count > 0 ? count : 0,
          };
          return updatedNotification;
        }
        return notification;
      });
    });
  };
  const loadLastChatRoom = () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const userRef = dbRef(getDatabase(), `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const lastChatRoomId = snapshot.val()?.lastChatRoomId;
        const lastChatRoom = chatRooms.find(
          (room) => room.id === lastChatRoomId
        );

        if (lastChatRoom) {
          dispatch(setCurrentChatRoom(lastChatRoom));
          setActiveChatRoomId(lastChatRoom.id);
          setFirstLoad(false);
        } else if (chatRooms.length > 0) {
          const firstChatRoom = chatRooms[0];
          dispatch(setCurrentChatRoom(firstChatRoom));
          setActiveChatRoomId(firstChatRoom.id);
          setFirstLoad(false);
        }
      });
    }
  };

  const changeChatRoom = (room) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const userRef = dbRef(getDatabase(), `users/${userId}`);
      update(userRef, { lastChatRoomId: room.id });
    }
    clearNotifications();
    dispatch(setCurrentChatRoom(room));
    setActiveChatRoomId(room.id);
    dispatch(setPrivateChatRoom(false));
  };

  const clearNotifications = () => {
    const updatedNotifications = [...notifications];
    const index = updatedNotifications.findIndex(
      (notification) => notification.id === chatRoom.id
    );
    if (index !== -1) {
      updatedNotifications[index].lastKnownTotal =
        updatedNotifications[index].total;
      setNotifications(updatedNotifications);
    }
  };
  const getNotificationCount = (room) => {
    let count = 0;
    notifications.forEach((notification) => {
      if (notification.id === room.id) {
        count = notification.count;
      }
    });
    if (count > 0) {
      return count;
    }
  };

  const renderChatRooms = (chatRooms) => {
    return (
      chatRooms.length > 0 &&
      chatRooms.map((room) => {
        const notificationCount = getNotificationCount(room);
        return (
          <StChatRoomList
            key={room.id}
            active={active && room.id === activeChatRoomId ? true : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onClick(user);
              changeChatRoom(room);
            }}
          >
            # {room.roomName}
            <Badge
              style={{
                float: "right",
                marginTop: "4px",
              }}
              variant="danger"
            >
              {notificationCount}
            </Badge>
          </StChatRoomList>
        );
      })
    );
  };

  useEffect(() => {
    chatRooms?.forEach((room) => {
      const chatRoomMessagesRef = child(messagesRef, room.id);
      onValue(chatRoomMessagesRef, (dataSnapshot) => {
        if (chatRoom) {
          handleNotification(room.id, chatRoom.id, dataSnapshot);
        }
      });
    });
    //eslint-disable-next-line
  }, [chatRooms, chatRoom]);

  return (
    <StChatRoomContainer>
      <StChatRoomInner>
        <FaRegSmileWink style={{ marginRight: 10 }} />
        채팅방 ({chatRooms.length})
        <FaPlus
          style={{ position: "absolute", right: 0, cursor: "pointer" }}
          onClick={handleShow}
        />
      </StChatRoomInner>
      <StChatRoomUL>{renderChatRooms(chatRooms)}</StChatRoomUL>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>채팅방 생성하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateChatRoom}>
            <Form.Group className="mb-3" controlId="roomName">
              <Form.Label>방 이름</Form.Label>
              <Form.Control
                type="text"
                placeholder="방 이름을 적어주세요"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="roomDesc">
              <Form.Label>방 설명</Form.Label>
              <Form.Control
                type="text"
                placeholder="방 상세설명을 적어주세요"
                value={roomDes}
                onChange={(e) => setRoomDes(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleCreateChatRoom}>
            생성하기
          </Button>
        </Modal.Footer>
      </Modal>
    </StChatRoomContainer>
  );
};

export default ChatRooms;

const StChatRoomContainer = styled.div``;
const StChatRoomInner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;
const StChatRoomUL = styled.ul`
  margin-top: 10px;
  list-style: none;
  padding: 0;
  padding-left: 10px;
`;
const StChatRoomList = styled.li`
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
